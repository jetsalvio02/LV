import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const admin = await requireAdmin();

    // Example admin-only logic
    const users = [
      { id: 1, email: "admin@example.com", role: "ADMIN" },
      { id: 2, email: "user@example.com", role: "USER" },
    ];

    return NextResponse.json({
      success: true,
      adminId: admin.userId,
      data: users,
    });
  } catch (err: any) {
    if (err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
