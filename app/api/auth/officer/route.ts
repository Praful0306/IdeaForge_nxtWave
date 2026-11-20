import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { pin } = await req.json();
    const expectedPin = process.env.OFFICER_PIN || "7789";

    if (!pin || String(pin).trim() !== expectedPin.trim()) {
      return NextResponse.json({ error: "Invalid Officer Security PIN" }, { status: 401 });
    }

    const res = NextResponse.json({ success: true, message: "Officer authenticated successfully" });

    // Set secure httpOnly cookie
    res.cookies.set({
      name: "officer_session",
      value: "authenticated",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 8 * 60 * 60, // 8 hours shift
      path: "/",
    });

    return res;
  } catch {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ success: true, message: "Logged out" });
  res.cookies.delete("officer_session");
  return res;
}
