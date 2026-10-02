import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_TTL_SECONDS,
  checkCredentials,
  createSession,
} from "@/lib/session";

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, status: "error", message: "Invalid request body." },
      { status: 400 }
    );
  }

  const username = String(body.username ?? "");
  const password = String(body.password ?? "");
  const protocolVersion =
    typeof body.protocol_version === "number" ? body.protocol_version : 0;
  const installationId = String(body.installation_id ?? "unknown-device");
  const requestNonce = String(body.request_nonce ?? "");

  if (protocolVersion !== 2) {
    return NextResponse.json(
      { success: false, status: "error", message: "Unsupported protocol version." },
      { status: 400 }
    );
  }

  if (!checkCredentials(username, password)) {
    return NextResponse.json(
      {
        success: false,
        status: "error",
        authenticated: false,
        message: "Invalid username, password, or account access.",
        protocol_version: 2,
      },
      { status: 401 }
    );
  }

  const { record, accessToken } = createSession({
    username,
    deviceId: installationId,
    installationId,
    loginNonce: requestNonce,
  });

  return NextResponse.json({
    success: true,
    status: "success",
    authenticated: true,
    session_id: record.sessionId,
    access_token: accessToken,
    token: accessToken,
    session_token: accessToken,
    device_id: record.deviceId,
    installation_id: record.installationId,
    request_nonce: requestNonce,
    server_time: record.serverTime,
    expires_at: record.expiresAt,
    expires_in: SESSION_TTL_SECONDS,
    heartbeat_interval_seconds: 60,
    message: "ok",
    session: { token: accessToken, expires: "2030-01-01T00:00:00.000Z" },
    user: { id: 1, username },
    username,
    expires: "2030-01-01T00:00:00.000Z",
    protocol_version: 2,
  });
}
