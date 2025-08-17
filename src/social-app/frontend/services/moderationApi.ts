import { auth } from '../firebase';

async function authFetch(input: RequestInfo, init: RequestInit = {}) {
  const user = auth.currentUser;
  const token = user ? await user.getIdToken() : undefined;
  const headers = new Headers(init.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return fetch(input, { ...init, headers });
}

export async function listModeration(limit = 50, filter?: 'reported', q?: string) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (filter) params.set('filter', filter);
  if (q && q.trim()) params.set('q', q.trim());
  const res = await authFetch(`/api/admin/moderation/list?${params.toString()}`);
  if (!res.ok) throw new Error('list_failed');
  return res.json();
}
