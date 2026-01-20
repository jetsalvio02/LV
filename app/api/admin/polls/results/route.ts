import { NextResponse } from "next/server";
import { database } from "@/lib/db";
import { polls, poll_options, votes } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET() {
  // 1. Fetch all polls (you can filter ACTIVE/CLOSED if needed)
  const allPolls = await database
    .select({
      id: polls.id,
      title: polls.title,
      type: polls.type,
    })
    .from(polls);

  const resultsResponse = [];

  // 2. Loop each poll and compute results
  for (const poll of allPolls) {
    const optionStats = await database
      .select({
        optionId: poll_options.id,
        label: poll_options.label,
        count: sql<number>`COUNT(${votes.id})`,
      })
      .from(poll_options)
      .leftJoin(votes, eq(votes.option_id, poll_options.id))
      .where(eq(poll_options.poll_id, poll.id))
      .groupBy(poll_options.id, poll_options.label);

    const totalVotes = optionStats.reduce((sum, o) => sum + Number(o.count), 0);

    const computedResults = optionStats.map((o) => ({
      optionId: o.optionId,
      label: o.label,
      count: Number(o.count),
      percentage:
        totalVotes === 0 ? 0 : Math.round((Number(o.count) / totalVotes) * 100),
    }));

    resultsResponse.push({
      poll: {
        id: poll.id,
        title: poll.title,
        type: poll.type,
      },
      totalVotes,
      results: computedResults,
    });
  }

  return NextResponse.json(resultsResponse);
}
