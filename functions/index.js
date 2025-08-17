const {onRequest} = require("firebase-functions/v2/https");
const {defineSecret} = require("firebase-functions/params");
const admin = require("firebase-admin");
try {
  admin.app();
} catch (_) {
  admin.initializeApp();
}
const logger = require("firebase-functions/logger");
const REGION = "europe-west1";
const ADMIN_SECRET = defineSecret("ADMIN_BOOTSTRAP_CODE");

async function verifyAuth(req) {
  try {
    const h = req.headers.authorization || req.headers.Authorization || "";
    const m = /^Bearer\s+(.+)$/.exec(String(h));
    if (!m) return null;
    return await admin.auth().verifyIdToken(m[1], true);
  } catch (_) {
    return null;
  }
}

function hasOwner(decoded) {
  const r = decoded?.roles || decoded?.role || {};
  return typeof r === "string" ? r === "owner" : !!r?.owner;
}

async function requireAdmin(req) {
  const decoded = await verifyAuth(req);
  if (!decoded) return null;
  const r = decoded.roles || decoded.role || {};
  const isAdmin = typeof r === "string" ? r === "admin" : !!r.admin;
  return isAdmin || hasOwner(decoded) ? decoded : null;
}

async function logAudit(entry) {
  try {
    await admin.firestore().collection("trust_audit").add({...entry, ts: admin.firestore.FieldValue.serverTimestamp()});
  } catch (e) {
    logger.warn("audit_log_failed", String(e));
  }
}

exports.adminBootstrap = onRequest({cors: true, maxInstances: 1, region: REGION, secrets: [ADMIN_SECRET]}, async (req, res) => {
  try {
    if (req.method !== "POST") return res.status(405).json({ok: false, error: "method_not_allowed"});
    const decoded = await verifyAuth(req);
    if (!decoded) return res.status(401).json({ok: false, error: "unauthenticated"});
    const {code} = req.body || {};
    const expected = ADMIN_SECRET.value();
    if (!expected || String(code || "").trim() !== expected) return res.status(403).json({ok: false, error: "invalid_code"});
    const user = await admin.auth().getUser(decoded.uid);
    const prior = user.customClaims || {};
    const roles = Object.assign({}, prior.roles || {}, {owner: true, admin: true});
    await admin.auth().setCustomUserClaims(user.uid, {...prior, roles});
    await logAudit({actorUid: decoded.uid, action: "bootstrap_admin", target: {uid: user.uid}});
    return res.status(200).json({ok: true, uid: user.uid, roles});
  } catch (err) {
    logger.error("adminBootstrap error", {err: String(err)});
    return res.status(500).json({ok: false, error: "internal_error"});
  }
});

exports.adminApi = onRequest({cors: true, maxInstances: 10, region: REGION}, async (req, res) => {
  try {
    const p = (req.path || req.url || "").toLowerCase();
    const db = admin.firestore();
    // Public route: affiliates search (mock fallback)
    if (p.includes("/affiliates/search")) {
      const q = String((req.query?.q || req.query?.Q || "")).toLowerCase();
      const base = [
        {id: "amazon", kind: "merchant", name: "Amazon", domain: "amazon.fr", logoUrl: "https://logo.clearbit.com/amazon.com"},
        {id: "etsy", kind: "merchant", name: "Etsy", domain: "etsy.com", logoUrl: "https://logo.clearbit.com/etsy.com"},
        {id: "adobe", kind: "merchant", name: "Adobe", domain: "adobe.com", logoUrl: "https://logo.clearbit.com/adobe.com"},
        {id: "figma", kind: "merchant", name: "Figma", domain: "figma.com", logoUrl: "https://logo.clearbit.com/figma.com"},
        {id: "canon-eos-r", kind: "product", name: "Canon EOS R", domain: "canon.fr", logoUrl: "https://logo.clearbit.com/canon.fr"},
        {id: "sony-a7-iv", kind: "product", name: "Sony A7 IV", domain: "sony.com", logoUrl: "https://logo.clearbit.com/sony.com"},
      ];
      const filtered = q ? base.filter((s) => s.name.toLowerCase().includes(q) || (s.domain && s.domain.toLowerCase().includes(q))) : base.slice(0, 5);
      return res.status(200).json(filtered);
    }

    // Public route: affiliates validate (echo back with basic normalization)
    if (p.includes("/affiliates/validate")) {
      if (req.method !== "POST") return res.status(405).json({ok: false, error: "method_not_allowed"});
      const {items} = req.body || {};
      const arr = Array.isArray(items) ? items : [];
      const normalized = arr.map((x) => ({
        source: "skimlinks",
        kind: x.kind || "merchant",
        id: String(x.id || "").trim() || "unknown",
        name: x.name || "",
        domain: x.domain || "",
        logoUrl: x.logoUrl || "",
        deeplinkTemplate: x.deeplinkTemplate || "",
      }));
      return res.status(200).json(normalized);
    }

    // Public route: invite redemption (kept lightweight for MVP)
    if (p.includes("/invites/redeem")) {
      if (req.method !== "POST") return res.status(405).json({ok: false, error: "method_not_allowed"});
      const {code} = req.body || {};
      const inviteCode = String(code || "").trim().toUpperCase();
      if (!inviteCode) return res.status(400).json({ok: false, error: "missing_code"});
      const ref = db.collection("invites").doc(inviteCode);
      const snap = await ref.get();
      if (!snap.exists) return res.status(400).json({ok: false, error: "invalid"});
      const data = snap.data() || {};
      if (data.redeemed || data.active === false) return res.status(400).json({ok: false, error: "invalid"});
      // Optional: attribute redemption to authenticated user when available
      const who = await verifyAuth(req);
      await Promise.all([
        ref.set({redeemed: true, redeemedAt: admin.firestore.FieldValue.serverTimestamp(), redeemedBy: who ? {uid: who.uid, email: who.email || null} : null}, {merge: true}),
        db.collection("invite_redemptions").add({
          code: inviteCode,
          ts: admin.firestore.FieldValue.serverTimestamp(),
          ua: String(req.headers["user-agent"] || ""),
          ip: String((req.headers["x-forwarded-for"] || "").toString().split(",")[0] || req.ip || ""),
        }),
      ]);
      return res.status(200).json({ok: true});
    }

    // Admin-only routes below
    const decoded = await requireAdmin(req);
    if (!decoded) return res.status(401).json({ok: false, error: "unauthorized"});

    if (p.includes("/users/roles")) {
      if (req.method !== "POST") return res.status(405).json({ok: false, error: "method_not_allowed"});
      const {uid, add, remove, reason} = req.body || {};
      if (!uid) return res.status(400).json({ok: false, error: "missing_uid"});
      const user = await admin.auth().getUser(uid);
      const prior = user.customClaims || {};
      const roles = Object.assign({}, prior.roles || {});
      if (Array.isArray(add)) add.forEach((r) => (roles[r] = true));
      if (Array.isArray(remove)) remove.forEach((r) => delete roles[r]);
      await admin.auth().setCustomUserClaims(uid, {...prior, roles});
      await logAudit({actorUid: decoded.uid, action: "users_roles_update", target: {uid}, before: {roles: prior.roles || {}}, after: {roles}, reason: reason || ""});
      return res.status(200).json({ok: true, roles});
    }

    if (p.includes("/users/ban")) {
      if (req.method !== "POST") return res.status(405).json({ok: false, error: "method_not_allowed"});
      const {uid, durationDays, reason} = req.body || {};
      if (!uid) return res.status(400).json({ok: false, error: "missing_uid"});
      const until = durationDays ? Date.now() + Number(durationDays) * 86400000 : null;
      await admin.auth().updateUser(uid, {disabled: true});
      await db.collection("users").doc(uid).set({banned: true, bannedUntil: until ? new Date(until) : null}, {merge: true});
      await logAudit({actorUid: decoded.uid, action: "users_ban", target: {uid}, reason: reason || "", until});
      return res.status(200).json({ok: true});
    }

    if (p.includes("/moderation/decide")) {
      if (req.method !== "POST") return res.status(405).json({ok: false, error: "method_not_allowed"});
      const {itemId, action, reason} = req.body || {};
      if (!itemId || !action) return res.status(400).json({ok: false, error: "missing_params"});
      const allowed = new Set(["mask", "remove", "restore", "validate"]);
      if (!allowed.has(String(action))) return res.status(400).json({ok: false, error: "invalid_action"});
      const ref = db.collection("posts").doc(String(itemId));
      const updates = {updatedAt: admin.firestore.FieldValue.serverTimestamp()};
      if (action === "mask") {
        updates.status = "masked";
        updates.maskedAt = admin.firestore.FieldValue.serverTimestamp();
      } else if (action === "remove") {
        updates.status = "removed";
        updates.removedAt = admin.firestore.FieldValue.serverTimestamp();
      } else if (action === "restore" || action === "validate") {
        updates.status = "active";
        updates.maskedAt = null;
        updates.removedAt = null;
      }
      await ref.set(updates, {merge: true});
      await logAudit({actorUid: decoded.uid, action: "moderation_decide", target: {itemId}, details: {action}, reason: reason || ""});
      return res.status(200).json({ok: true});
    }

    if (p.includes("/moderation/list")) {
      const lim = Math.min(200, Math.max(1, Number(req.query.limit || 50)));
      const filter = String(req.query.filter || "").toLowerCase();
      const q = String(req.query.q || "").toLowerCase().trim();
      const snap = await db.collection("posts").orderBy("createdAt", "desc").limit(lim * 2).get();
      const items = [];
      snap.forEach((d) => {
        const data = d.data() || {};
        const agg = data.agg || {};
        const status = agg.stable ? "stable" : (typeof agg.wfs === "number" && agg.wfs >= 2.5 ? "masked" : "provisional");
        const echoesStats = data.echoesStats || null;
        const item = {
          id: d.id,
          username: data.username || data.authorName || "",
          userId: data.userId || "",
          title: data.title || "",
          createdAt: data.createdAt ? data.createdAt.toDate?.()?.toISOString?.() || null : null,
          agg: {ratingsCount: agg.ratingsCount || 0, trustedCount: agg.trustedCount || 0, maxClusterShare: agg.maxClusterShare || 0, wfs: agg.wfs || 0, stable: !!agg.stable},
          echoes: echoesStats ? {averages: echoesStats.averages || null, totalAverage: echoesStats.totalAverage || null, ratingsCount: echoesStats.ratingsCount || 0} : null,
          status,
        };
        let ok = true;
        if (filter === "reported") ok = ok && (typeof agg.wfs === "number" && agg.wfs > 0);
        if (q) {
          const hay = `${item.id}\n${item.title}\n${item.username}\n${item.userId}`.toLowerCase();
          ok = ok && hay.includes(q);
        }
        if (ok) items.push(item);
      });
      items.sort((a, b) => {
        const rank = (x) => (x.status === "masked" ? 0 : x.status === "provisional" ? 1 : 2);
        const dr = rank(a) - rank(b);
        if (dr !== 0) return dr;
        return (b.agg.wfs || 0) - (a.agg.wfs || 0);
      });
      return res.status(200).json({ok: true, items});
    }

    if (p.includes("/invites/user")) {
      const uidQ = (req.query.uid || "").toString().trim();
      const emailQ = (req.query.email || "").toString().trim().toLowerCase();
      let uid = uidQ;
      if (!uid && emailQ) {
        try {
          const u = await admin.auth().getUserByEmail(emailQ);
          uid = u.uid;
        } catch (_) {}
      }
      if (!uid) return res.status(400).json({ok: false, error: "missing_uid_or_email"});
      const userDoc = await db.collection("users").doc(uid).get();
      const data = userDoc.exists ? userDoc.data() : {};
      const out = {uid, username: data?.username || "", email: data?.email || emailQ || "", badge: data?.trust?.badge || "", invites: Object.assign({balance: 0, issuedThisMonth: 0, redeemedThisMonth: 0}, data?.trust?.invites || {}), trust: {T: data?.trust?.T || null}};
      return res.status(200).json({ok: true, user: out});
    }

    if (p.includes("/invites/credit")) {
      if (req.method !== "POST") return res.status(405).json({ok: false, error: "method_not_allowed"});
      const {uid, delta, reason} = req.body || {};
      if (!uid || typeof delta !== "number") return res.status(400).json({ok: false, error: "bad_request"});
      const ref = db.collection("users").doc(uid);
      await db.runTransaction(async (tx) => {
        const snap = await tx.get(ref);
        const data = snap.exists ? snap.data() : {};
        const invites = Object.assign({balance: 0, issuedThisMonth: 0, redeemedThisMonth: 0}, data?.trust?.invites || {});
        invites.balance = Math.max(0, (invites.balance || 0) + delta);
        const trust = Object.assign({}, data?.trust || {}, {invites});
        tx.set(ref, {trust}, {merge: true});
      });
      await logAudit({actorUid: decoded.uid, action: "invites_credit", target: {uid}, details: {delta}, reason: reason || ""});
      return res.status(200).json({ok: true});
    }

    if (p.includes("/invites/recent")) {
      const lim = Math.min(200, Math.max(1, Number(req.query.limit || 50)));
      const snap = await db.collection("invite_redemptions").orderBy("ts", "desc").limit(lim).get();
      const items = [];
      snap.forEach((d) => {
        const x = d.data() || {};
        const ipHash = x.ip ? require("crypto").createHash("sha256").update(String(x.ip)).digest("hex") : undefined;
        items.push({code: x.code || "", ts: x.ts?.toDate?.()?.toISOString?.() || null, ua: x.ua || "", ipHash});
      });
      return res.status(200).json({ok: true, items});
    }

    if (p.includes("/metrics/overview")) {
      const [usersSnap, postsSnap] = await Promise.all([
        admin.firestore().collection("users").get(),
        admin.firestore().collection("posts").get(),
      ]);
      const users = usersSnap.size;
      const posts = postsSnap.size;
      let masked = 0;
      let provisional = 0;
      let stable = 0;
      postsSnap.forEach((d) => {
        const agg = d.get("agg") || {};
        if (agg.stable) stable++;
        else provisional++;
        if (typeof agg.wfs === "number" && agg.wfs >= 2.5) masked++;
      });
      return res.status(200).json({ok: true, data: {users, posts, masked, provisional, stable}});
    }

    return res.status(404).json({ok: false, error: "unknown_route", path: p});
  } catch (err) {
    logger.error("adminApi error", {err: String(err)});
    return res.status(500).json({ok: false, error: "internal_error"});
  }
});
