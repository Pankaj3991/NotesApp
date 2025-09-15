import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "../../../lib/mongodb";
import User from "../../../models/User";
import Tenant from "../../../models/Tenant";
import { signJWT } from "../../../lib/jwt";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { email, password, tenantSlug } = await req.json();

    if (!email || !password || !tenantSlug) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const tenant = await Tenant.findOne({ slug: tenantSlug });
    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const user = await User.findOne({ email, tenantId: tenant._id });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }
    const token = await signJWT({
      _id: user._id.toString(),
      tenantId: tenant._id.toString(),
      role: user.role,
      email: user.email,
    });
    const res = NextResponse.json({ message: "Login successful" });
    res.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return res;
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    } else {
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }
}
