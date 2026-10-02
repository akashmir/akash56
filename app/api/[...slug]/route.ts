import { NextRequest, NextResponse } from "next/server";
import { SESSION_TTL_SECONDS, getByToken, nowEpoch } from "@/lib/session";

// Safety net: answer ANY unhandled /api/* route with a benign,
// heartbeat-shaped success payload instead of a 404. The desktop client
// treats non-JSON/4xx follow-up calls as session failures, so this keeps
// unknown endpoints from killing the session. Tighten per-endpoint once
// Vercel function logs reveal the real call map.
export async function GET(req: NextRequest) {
  return handle(req);
}

export async function POST(req: NextRequest) {
  return handle(req);
}

export async function PUT(req: NextRequest) {
  return handle(req);
}

export async function PATCH(req: NextRequest) {
  return handle(req);
}

export async function DELETE(req: NextRequest) {
  return handle(req);
}

async function handle(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const rec = getByToken(token);

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const now = nowEpoch();
  return NextResponse.json({
    success: true,
    status: "success",
    revoked: false,
    authenticated: true,
    session_id: rec?.sessionId ?? String(body.session_id ?? ""),
    access_token: token,
    token,
    session_token: token,
    device_id: rec?.deviceId ?? String(body.device_id ?? ""),
    installation_id:
      rec?.installationId ?? String(body.installation_id ?? ""),
    request_nonce:
      rec?.loginNonce ?? String(body.request_nonce ?? ""),
    username: rec?.username ?? "",
    user: { id: 1, username: rec?.username ?? "" },
    session: { token, expires: "2030-01-01T00:00:00.000Z" },
    expires: "2030-01-01T00:00:00.000Z",
    server_time: now,
    expires_at: rec?.expiresAt ?? now + SESSION_TTL_SECONDS,
    expires_in: SESSION_TTL_SECONDS,
    heartbeat_interval_seconds: 60,
    message: "ok",
    protocol_version: 2,
  });
}
