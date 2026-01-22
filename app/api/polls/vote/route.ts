import { NextResponse } from "next/server";
import { database } from "@/lib/db";
import { votes } from "@/lib/db/schema";
import { cookies } from "next/headers";
import { and, eq } from "drizzle-orm";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(req: Request) {
  const { pollId, optionId } = await req.json();

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let userId: number;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    userId = decoded.userId;
  } catch {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }

  const existingVote = await database
    .select()
    .from(votes)
    .where(and(eq(votes.poll_id, pollId), eq(votes.user_id, userId)))
    .limit(1);

  if (existingVote.length) {
    return NextResponse.json({ message: "Already voted" }, { status: 409 });
  }

  await database.insert(votes).values({
    poll_id: pollId,
    option_id: optionId,
    user_id: userId,
  });

  return NextResponse.json({ success: true });
}
