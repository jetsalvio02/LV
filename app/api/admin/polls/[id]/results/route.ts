import { NextResponse } from "next/server";
import { database } from "@/lib/db";
import { polls, poll_options, votes } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // 1. AUTH (ADMIN ONLY)
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const pollId = Number(id);

  const poll = await database
    .select()
    .from(polls)
    .where(eq(polls.id, pollId))
    .limit(1);

  if (!poll.length) {
    return NextResponse.json({ message: "Poll not found" }, { status: 404 });
  }

  const results = await database
    .select({
      optionId: poll_options.id,
      label: poll_options.label,
      image: poll_options.image_url,
      votes: sql<number>`COUNT(${votes.id})`,
    })
    .from(poll_options)
    .leftJoin(votes, eq(votes.option_id, poll_options.id))
    .where(eq(poll_options.poll_id, pollId))
    .groupBy(poll_options.id);

  return NextResponse.json({
    poll: poll[0],
    results,
  });
}
