import { NextRequest, NextResponse } from "next/server";
import { revokeByToken } from "@/lib/session";

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (token) revokeByToken(token);
  return NextResponse.json({ success: true, status: "success" });
}
