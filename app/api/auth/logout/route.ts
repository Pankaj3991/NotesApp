import { NextResponse } from "next/server";

export async function POST() {
  // Clear the cookie by setting empty value and immediate expiry
  const res = NextResponse.json({ message: "Logged out successfully" });

  res.cookies.set("auth_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    expires: new Date(0), // Expire immediately
  });

  return res;
}
