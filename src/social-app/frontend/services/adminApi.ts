import { auth } from '../firebase';

async function authFetch(input: RequestInfo, init: RequestInit = {}) {
  const user = auth.currentUser;
  const token = user ? await user.getIdToken() : undefined;
  const headers = new Headers(init.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return fetch(input, { ...init, headers });
}

export async function getOverview() {
  const res = await authFetch('/api/admin/metrics/overview');
  if (!res.ok) throw new Error('overview_failed');
  return res.json();
}

export async function bootstrapAdmin(code: string, email: string) {
  const res = await authFetch('/api/admin/bootstrap', {
    method: 'POST',
    body: JSON.stringify({ code, email }),
  });
  if (!res.ok) throw new Error('bootstrap_failed');
  return res.json();
}

export async function updateUserRoles(uid: string, add: string[] = [], remove: string[] = [], reason = '') {
  const res = await authFetch('/api/admin/users/roles', {
    method: 'POST',
    body: JSON.stringify({ uid, add, remove, reason }),
  });
  if (!res.ok) throw new Error('roles_failed');
  return res.json();
}

export async function banUser(uid: string, durationDays?: number, reason = '') {
  const res = await authFetch('/api/admin/users/ban', {
    method: 'POST',
    body: JSON.stringify({ uid, durationDays, reason }),
  });
  if (!res.ok) throw new Error('ban_failed');
  return res.json();
}

export async function moderationDecide(itemId: string, action: string, reason = '') {
  const res = await authFetch('/api/admin/moderation/decide', {
    method: 'POST',
    body: JSON.stringify({ itemId, action, reason }),
  });
  if (!res.ok) throw new Error('moderation_failed');
  return res.json();
}

export async function getInvitesUser(params: { uid?: string; email?: string }) {
  const url = new URL('/api/admin/invites/user', window.location.origin);
  if (params.uid) url.searchParams.set('uid', params.uid);
  if (params.email) url.searchParams.set('email', params.email);
  const res = await authFetch(url.toString());
  if (!res.ok) throw new Error('invites_user_failed');
  return res.json();
}

export async function creditInvites(uid: string, delta: number, reason = '') {
  const res = await authFetch('/api/admin/invites/credit', {
    method: 'POST',
    body: JSON.stringify({ uid, delta, reason }),
  });
  if (!res.ok) throw new Error('invites_credit_failed');
  return res.json();
}

export async function listRecentRedemptions(limit = 50) {
  const res = await authFetch(`/api/admin/invites/recent?limit=${encodeURIComponent(String(limit))}`);
  if (!res.ok) throw new Error('invites_recent_failed');
  return res.json();
}

export async function ownerGrant() {
  const res = await authFetch('/api/admin/owner/grant', {
    method: 'POST',
    body: JSON.stringify({}),
  });
  if (!res.ok) {
    // Include status code to help callers distinguish 401/403/404 quickly in dev
    throw new Error(`owner_grant_failed:${res.status}`);
  }
  return res.json();
}
