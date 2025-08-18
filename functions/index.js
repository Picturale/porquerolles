const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
try {
  admin.app();
} catch (_) {
  admin.initializeApp();
}
const logger = require("firebase-functions/logger");
const REGION = "europe-west1";
const ADMIN_SECRET_VALUE = process.env.ADMIN_BOOTSTRAP_CODE || "";
const DATABASE_ID = process.env.FIREBASE_DATABASE_ID || "porquerolles";

// Global Firestore instance targeting named database
const db = getFirestore(admin.app(), DATABASE_ID);


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
    await db.collection("trust_audit").add({ ...entry, ts: FieldValue.serverTimestamp() });
  } catch (e) {
    logger.warn("audit_log_failed", String(e));
  }
}

exports.adminBootstrap = onRequest({ cors: true, maxInstances: 1, region: REGION }, async (req, res) => {
  try {
    if (req.method !== "POST") return res.status(405).json({ ok: false, error: "method_not_allowed" });
    const decoded = await verifyAuth(req);
    if (!decoded) return res.status(401).json({ ok: false, error: "unauthenticated" });
    const { code } = req.body || {};
    const expected = ADMIN_SECRET_VALUE;
    if (!expected) return res.status(503).json({ ok: false, error: "secret_not_configured" });
    if (!expected || String(code || "").trim() !== expected) return res.status(403).json({ ok: false, error: "invalid_code" });
    const user = await admin.auth().getUser(decoded.uid);
    const prior = user.customClaims || {};
    const roles = Object.assign({}, prior.roles || {}, { owner: true, admin: true });
    await admin.auth().setCustomUserClaims(user.uid, { ...prior, roles });
    await logAudit({ actorUid: decoded.uid, action: "bootstrap_admin", target: { uid: user.uid } });
    return res.status(200).json({ ok: true, uid: user.uid, roles });
  } catch (err) {
    logger.error("adminBootstrap error", { err: String(err) });
    return res.status(500).json({ ok: false, error: "internal_error" });
  }
});

// Public: search internal products created by users (pro shops)
exports.productsSearch = onRequest({ cors: true, maxInstances: 10, region: REGION }, async (req, res) => {
  try {
    const q = String((req.query?.q || req.query?.Q || "")).trim().toLowerCase();
    const limit = Math.min(30, Math.max(1, Number(req.query?.limit || 20)));
    // use global db for named database
    let snap;
    try {
      snap = await db.collection("products").orderBy("updatedAt", "desc").limit(120).get();
    } catch (_) {
      try {
        snap = await db.collection("products").orderBy("createdAt", "desc").limit(120).get();
      } catch (e) {
        snap = await db.collection("products").limit(120).get();
      }
    }
    const items = [];
    const ownerIds = new Set();
    const rawItems = [];

    // First pass: collect all items and owner IDs
    snap.forEach((doc) => {
      const r = doc.data() || {};
      const name = r.title || r.name || "";
      const hay = `${name}\n${r.description || ""}`.toLowerCase();
      if (q && !hay.includes(q)) return;

      rawItems.push({ id: doc.id, data: r });
      if (r.ownerId) ownerIds.add(r.ownerId);
    });

    // Second pass: fetch owner usernames
    const ownerMap = {};
    if (ownerIds.size > 0) {
      try {
        const ownerPromises = Array.from(ownerIds).map(async (ownerId) => {
          try {
            const userDoc = await db.collection("users").doc(ownerId).get();
            if (userDoc.exists) {
              const userData = userDoc.data();
              return { ownerId, username: userData.username || userData.displayName || "Utilisateur" };
            }
          } catch (_) {
            // ignore individual user fetch errors
          }
          return { ownerId, username: "Utilisateur" };
        });
        const ownerResults = await Promise.all(ownerPromises);
        ownerResults.forEach(({ ownerId, username }) => {
          ownerMap[ownerId] = username;
        });
      } catch (_) {
        // ignore owner fetching errors, proceed without owner info
      }
    }

    // Third pass: build final items with owner info
    rawItems.forEach(({ id, data: r }) => {
      const image = r.imageUrl || (Array.isArray(r.images) && r.images.length ? r.images[0] : null) || null;
      const seller = r.sellerUsername || r.seller || r.shopSlug || ownerMap[r.ownerId] || null;
      const linkUrl = r.linkUrl || (seller ? `/shop/${seller}/p/${id}` : `/product/${id}`);
      items.push({
        source: "internal",
        kind: "product",
        id,
        name: r.title || r.name || "",
        domain: "",
        logoUrl: "",
        imageUrl: image,
        description: r.description || "",
        linkUrl,
        price: r.price || null,
        ownerUsername: ownerMap[r.ownerId] || null,
        ownerId: r.ownerId || null,
      });
    });

    return res.status(200).json(items.slice(0, limit));
  } catch (err) {
    return res.status(500).json({ ok: false, error: "internal_error", message: String(err) });
  }
});

// Public: validate internal products (normalize)
exports.productsValidate = onRequest({ cors: true, maxInstances: 10, region: REGION }, async (req, res) => {
  try {
    if (req.method !== "POST") return res.status(405).json({ ok: false, error: "method_not_allowed" });
    const { items } = req.body || {};
    const arr = Array.isArray(items) ? items : [];
    const out = arr.map((i) => {
      const id = String(i.id || "");
      const name = String(i.name || "");
      const imageUrl = i.imageUrl || i.logoUrl || "";
      const description = i.description || "";
      const seller = i.sellerUsername || i.shopSlug || null;
      const linkUrl = i.linkUrl || (seller ? `/shop/${seller}/p/${id}` : `/product/${id}`);
      return {
        source: "internal",
        kind: "product",
        id,
        name,
        domain: "",
        logoUrl: "",
        imageUrl,
        description,
        linkUrl,
      };
    }).filter((x) => x.id && x.name);
    return res.status(200).json(out);
  } catch (err) {
    return res.status(500).json({ ok: false, error: "internal_error", message: String(err) });
  }
});





exports.adminApi = onRequest({ cors: true, maxInstances: 10, region: REGION }, async (req, res) => {
  try {
    const p = (req.path || req.url || "").toLowerCase();
    const db = admin.firestore();


  // Invite endpoints removed

    // Admin-only routes below
    const decoded = await requireAdmin(req);
    if (!decoded) return res.status(401).json({ ok: false, error: "unauthorized" });

    if (p.includes("/users/roles")) {
      if (req.method !== "POST") return res.status(405).json({ ok: false, error: "method_not_allowed" });
      const { uid, add, remove, reason } = req.body || {};
      if (!uid) return res.status(400).json({ ok: false, error: "missing_uid" });
      const user = await admin.auth().getUser(uid);
      const prior = user.customClaims || {};
      const roles = Object.assign({}, prior.roles || {});
      if (Array.isArray(add)) add.forEach((r) => (roles[r] = true));
      if (Array.isArray(remove)) remove.forEach((r) => delete roles[r]);
      await admin.auth().setCustomUserClaims(uid, { ...prior, roles });
      await logAudit({ actorUid: decoded.uid, action: "users_roles_update", target: { uid }, before: { roles: prior.roles || {} }, after: { roles }, reason: reason || "" });
      return res.status(200).json({ ok: true, roles });
    }

    if (p.includes("/users/ban")) {
      if (req.method !== "POST") return res.status(405).json({ ok: false, error: "method_not_allowed" });
      const { uid, durationDays, reason } = req.body || {};
      if (!uid) return res.status(400).json({ ok: false, error: "missing_uid" });
      const until = durationDays ? Date.now() + Number(durationDays) * 86400000 : null;
      await admin.auth().updateUser(uid, { disabled: true });
      await db.collection("users").doc(uid).set({ banned: true, bannedUntil: until ? new Date(until) : null }, { merge: true });
      await logAudit({ actorUid: decoded.uid, action: "users_ban", target: { uid }, reason: reason || "", until });
      return res.status(200).json({ ok: true });
    }

    if (p.includes("/moderation/decide")) {
      if (req.method !== "POST") return res.status(405).json({ ok: false, error: "method_not_allowed" });
      const { itemId, action, reason } = req.body || {};
      if (!itemId || !action) return res.status(400).json({ ok: false, error: "missing_params" });
      const allowed = new Set(["mask", "remove", "restore", "validate"]);
      if (!allowed.has(String(action))) return res.status(400).json({ ok: false, error: "invalid_action" });
      const ref = db.collection("posts").doc(String(itemId));
      const updates = { updatedAt: FieldValue.serverTimestamp() };
      if (action === "mask") {
        updates.status = "masked";
        updates.maskedAt = FieldValue.serverTimestamp();
      } else if (action === "remove") {
        updates.status = "removed";
        updates.removedAt = FieldValue.serverTimestamp();
      } else if (action === "restore" || action === "validate") {
        updates.status = "active";
        updates.maskedAt = null;
        updates.removedAt = null;
      }
      await ref.set(updates, { merge: true });
      await logAudit({ actorUid: decoded.uid, action: "moderation_decide", target: { itemId }, details: { action }, reason: reason || "" });
      return res.status(200).json({ ok: true });
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
          agg: { ratingsCount: agg.ratingsCount || 0, trustedCount: agg.trustedCount || 0, maxClusterShare: agg.maxClusterShare || 0, wfs: agg.wfs || 0, stable: !!agg.stable },
          echoes: echoesStats ? { averages: echoesStats.averages || null, totalAverage: echoesStats.totalAverage || null, ratingsCount: echoesStats.ratingsCount || 0 } : null,
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
      return res.status(200).json({ ok: true, items });
    }

  // /invites/user removed

  // /invites/credit removed

  // /invites/recent removed

    if (p.includes("/metrics/overview")) {
      const [usersSnap, postsSnap] = await Promise.all([
        db.collection("users").get(),
        db.collection("posts").get(),
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
      return res.status(200).json({ ok: true, data: { users, posts, masked, provisional, stable } });
    }

    return res.status(404).json({ ok: false, error: "unknown_route", path: p });
  } catch (err) {
    logger.error("adminApi error", { err: String(err) });
    return res.status(500).json({ ok: false, error: "internal_error" });
  }
});
