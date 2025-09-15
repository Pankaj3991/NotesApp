import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../lib/mongodb";
import Tenant, { ITenant } from "../../models/Tenant";
import User, { IUser } from "../../models/User";

// POST /api/tenants/add
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { name, slug, plan } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Missing name or slug" },
        { status: 400 }
      );
    }

    // Check if tenant already exists
    const existing = await Tenant.findOne({ slug: slug.toLowerCase() });
    if (existing) {
      return NextResponse.json(
        { error: "Tenant already exists" },
        { status: 400 }
      );
    }

    const tenant: ITenant = await Tenant.create({
      name,
      slug: slug.toLowerCase(),
      plan: plan || "Free",
    });

    return NextResponse.json({ message: "Tenant created", tenant });
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

export async function PUT(req: NextRequest) {
  await connectDB();

  try {
    // Get tenantId and user role from headers
    const tenantId = req.headers.get("x-tenantId");

    if (!tenantId) {
      return NextResponse.json(
        { message: "Tenant ID missing" },
        { status: 400 }
      );
    }

    // Find tenant
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return NextResponse.json(
        { message: "Tenant not found" },
        { status: 404 }
      );
    }
    // Upgrade subscription to PRO
    tenant.subscription = "pro";
    await tenant.save();
    return NextResponse.json({
      message: `Tenant ${tenant.name} upgraded to PRO successfully`,
      tenant: {
        id: tenant._id,
        slug: tenant.slug,
        name: tenant.name,
        subscription: tenant.subscription,
      },
    });
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

export async function GET(req: NextRequest) {
  await connectDB();

  try {
    // Get tenantId and user role from headers
    const tenantId = req.headers.get("x-tenantId");
    const role = req.headers.get("x-user-role");

    if (!tenantId) {
      return NextResponse.json(
        { message: "Tenant ID missing" },
        { status: 400 }
      );
    }

    // Optional: only allow certain roles to upgrade
    if (role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    // Find tenant
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return NextResponse.json(
        { message: "Tenant not found" },
        { status: 404 }
      );
    }
    const userCount = await User.countDocuments({ tenantId });

    return NextResponse.json({ tenant, userCount });
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
