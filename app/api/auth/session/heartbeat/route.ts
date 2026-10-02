import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_TTL_SECONDS,
  getBySession,
  getByToken,
  nowEpoch,
} from "@/lib/session";

function unauthorized(message: string) {
  return NextResponse.json(
    { status: "error", message, revoked: true },
    { status: 401 }
  );
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return unauthorized("Invalid request body.");
  }

  if (!token) return unauthorized("Unauthorized.");

  // Prefer the login-time record so every field stays stable across
  // heartbeats; fall back to echoing request values (stateless mode).
  const rec = getByToken(token) ?? getBySession(String(body.session_id ?? ""));

  const sessionId = rec?.sessionId ?? String(body.session_id ?? "");
  const deviceId = rec?.deviceId ?? String(body.device_id ?? "");
  const installationId =
    rec?.installationId ?? String(body.installation_id ?? "");
  const username = rec?.username ?? "";
  const now = nowEpoch();
  const expiresAt = rec?.expiresAt ?? now + SESSION_TTL_SECONDS;

  return NextResponse.json({
    success: true,
    status: "success",
    revoked: false,
    authenticated: true,
    session_id: sessionId,
    access_token: token,
    token,
    session_token: token,
    device_id: deviceId,
    installation_id: installationId,
    // Echo the login-time nonce: the client binds the session to the
    // original request values, not the heartbeat's fresh nonce.
    request_nonce: rec?.loginNonce ?? String(body.request_nonce ?? ""),
    username,
    user: { id: 1, username },
    session: { token, expires: "2030-01-01T00:00:00.000Z" },
    expires: "2030-01-01T00:00:00.000Z",
    server_time: now,
    expires_at: expiresAt,
    expires_in: SESSION_TTL_SECONDS,
    heartbeat_interval_seconds: 60,
    message: "ok",
    protocol_version: 2,
  });
}
