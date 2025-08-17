# Invites Overview

Minimal invite gate for guest access:

- Frontend gate (`InviteGate.jsx`) protects `/login` and `/register` for guests; redirects to `/invite` when no local approval flag.
- Invite page (`pages/Invite.jsx`) accepts a code and calls `/api/invites/redeem`.
- Functions endpoint (`invitesRedeem`) validates code (mock rule) and returns `{ ok: true }` when accepted.
- Hosting rewrite maps `/api/invites/redeem` to the function; Vite dev middleware mocks it when no Functions base is configured.

Next steps:

- Replace mock with Firestore-backed invites collection (`invites`) with fields: `code`, `createdBy`, `usesLeft`, `expiresAt`, `status`.
- Add admin UI for generating and tracking invites.
- When a user completes signup, decrement `usesLeft` and link inviter/target in `invite_edges`.
