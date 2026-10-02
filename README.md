# Ziva Auth Backend (protocol-v2)

Minimal backend implementing the exact API surface the Ziva desktop app
expects. Schemas were reverse engineered from the client binary.

## Endpoints

- `POST /api/authenticate`
  Body: `{ username, password, protocol_version: 2, installation_id,
  request_nonce, client_version, device_info, public_ip }`
  Success (200): `{ success: true, status: "success", session_id,
  access_token, device_id, installation_id, request_nonce (echo),
  server_time (epoch), expires_at (epoch), expires_in (3600),
  heartbeat_interval_seconds, message, user, protocol_version: 2 }`
  Failure (401): `{ success: false, status: "error", message:
  "Invalid username, password, or account access." }`
- `POST /api/auth/session/heartbeat`
  Headers: `Authorization: Bearer <access_token>` plus the `X-Ziva-*` headers.
  Body: `{ session_id, device_id, installation_id, protocol_version,
  request_nonce, request_timestamp, client_version }`
  Success (200): echoes the login-time session values with fresh
  `server_time`. Unknown/expired sessions get 401 with `revoked: true`.
- `POST /api/auth/session/logout` — revokes the bearer session.

## Credentials

Set these as **Environment Variables** in the Vercel dashboard
(Settings → Environment Variables), then redeploy:

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`

Fallback placeholders live in `lib/session.ts` (`checkCredentials`) — change
them if you deploy without env vars.

## Deploy to Vercel (project name MUST keep host ≤ 18 chars)

1. Push this folder to a GitHub repo.
2. Vercel dashboard → Add New → Project → Import the repo.
3. Project name: `akash56` (gives `akash56.vercel.app`).
4. Framework preset: Next.js. Deploy.
5. Add the `ADMIN_USERNAME` / `ADMIN_PASSWORD` env vars, redeploy.

## Local test

```bash
npm install
npm run dev
curl -s -X POST localhost:3000/api/authenticate \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"change-me-123","protocol_version":2,"installation_id":"test","request_nonce":"n"}'
```

## Notes

- The desktop client validates `300 <= expires_in <= 4194304` and requires
  `status === "success"`. Don't change those shapes without re-testing.
- Device-signature verification (`X-Ziva-Device-*` proof v1) is intentionally
  not enforced (lab backend).
- The desktop client needs its heartbeat mismatch guard bypassed (see the
  `patch.py`/`watcher.py` tooling) until the exact `request_nonce` binding
  expectation is confirmed against this backend.
