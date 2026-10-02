import { randomBytes } from "crypto";

// ---------------------------------------------------------------------------
// In-memory session store.
//
// NOTE for production-like use: serverless instances don't share memory.
// For a single-user lab deployment this is fine. The heartbeat handler also
// falls back to echoing request values, so sessions survive instance churn.
// ---------------------------------------------------------------------------

export interface SessionRecord {
  username: string;
  sessionId: string;
  deviceId: string;
  installationId: string;
  loginNonce: string;
  accessToken: string;
  serverTime: number;
  expiresAt: number;
}

const byToken = new Map<string, SessionRecord>();
const bySession = new Map<string, SessionRecord>();

export function mintToken(): string {
  return "ZV1." + randomBytes(24).toString("hex");
}

export function mintSessionId(): string {
  return "SES-" + randomBytes(16).toString("hex");
}

export function nowEpoch(): number {
  return Math.floor(Date.now() / 1000);
}

// Client requires 300 <= expires_in <= 4194304.
export const SESSION_TTL_SECONDS = 3600;

export function createSession(args: {
  username: string;
  deviceId: string;
  installationId: string;
  loginNonce: string;
}): { record: SessionRecord; accessToken: string } {
  const accessToken = mintToken();
  const now = nowEpoch();
  const record: SessionRecord = {
    username: args.username,
    sessionId: mintSessionId(),
    deviceId: args.deviceId,
    installationId: args.installationId,
    loginNonce: args.loginNonce,
    accessToken,
    serverTime: now,
    expiresAt: now + SESSION_TTL_SECONDS,
  };
  byToken.set(accessToken, record);
  bySession.set(record.sessionId, record);
  return { record, accessToken };
}

export function getByToken(token: string): SessionRecord | undefined {
  return byToken.get(token);
}

export function getBySession(sessionId: string): SessionRecord | undefined {
  return bySession.get(sessionId);
}

export function revokeByToken(token: string): void {
  const rec = byToken.get(token);
  if (rec) {
    byToken.delete(token);
    bySession.delete(rec.sessionId);
  }
}

// Credentials: prefer env vars (set these in the Vercel dashboard).
// The placeholder fallback below is only for first-boot testing —
// CHANGE IT or set ADMIN_USERNAME / ADMIN_PASSWORD before real use.
export function checkCredentials(username: string, password: string): boolean {
  const wantUser = process.env.ADMIN_USERNAME || "admin";
  const wantPass = process.env.ADMIN_PASSWORD || "change-me-123";
  return username === wantUser && password === wantPass;
}
