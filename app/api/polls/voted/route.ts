import { NextResponse } from "next/server";
import { database } from "@/lib/db";
import { votes } from "@/lib/db/schema";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return NextResponse.json({ votedPollIds: [] });
  }

  let userId: number;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    userId = decoded.userId;
  } catch {
    return NextResponse.json({ votedPollIds: [] });
  }

  const rows = await database
    .select({ pollId: votes.poll_id })
    .from(votes)
    .where(eq(votes.user_id, userId));

  return NextResponse.json({
    votedPollIds: rows.map((r) => r.pollId),
  });
}
