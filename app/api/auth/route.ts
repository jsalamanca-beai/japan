import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, setAuthCookie, clearAuthCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!verifyPassword(password)) {
      return NextResponse.json({ error: "Invalid access code" }, { status: 401 });
    }

    await setAuthCookie();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}

export async function DELETE() {
  await clearAuthCookie();
  return NextResponse.json({ success: true });
}
