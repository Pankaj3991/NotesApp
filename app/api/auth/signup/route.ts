import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "../../../lib/mongodb";
import User from "../../../models/User";
import Tenant from "../../../models/Tenant";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { email, password, tenantSlug, role = "member" } = await req.json();

    if (!email || !password || !tenantSlug) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const tenant = await Tenant.findOne({ slug: tenantSlug });
    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const existing = await User.findOne({ email, tenantId: tenant._id });
    if (existing) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      passwordHash: hashed,
      role,
      tenantId: tenant._id,
    });

    return NextResponse.json({ message: "User created", userId: user._id });
  } catch (err: any) {
    console.error("Signup error:", err.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
