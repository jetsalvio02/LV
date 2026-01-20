import { NextResponse } from "next/server";
import { database } from "@/lib/db";
import { desc, eq } from "drizzle-orm";
import { polls } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const data = await database
    .select()
    .from(polls)
    .orderBy(desc(polls.created_at));

  return NextResponse.json(data);
}
