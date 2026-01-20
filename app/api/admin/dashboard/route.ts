import { NextResponse } from "next/server";
import { database } from "@/lib/db";
import { polls, votes, poll_options } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET() {
  /* KPI: total votes */
  const [{ totalVotes }] = await database
    .select({ totalVotes: sql<number>`count(*)` })
    .from(votes);

  /* KPI: active polls */
  const [{ activePolls }] = await database
    .select({ activePolls: sql<number>`count(*)` })
    .from(polls)
    .where(eq(polls.status, "ACTIVE"));

  /* Vote distribution */
  const distribution = await database
    .select({
      option: poll_options.label,
      votes: sql<number>`count(${votes.id})`,
    })
    .from(votes)
    .leftJoin(poll_options, eq(votes.option_id, poll_options.id))
    .groupBy(poll_options.label);

  /* Votes over time (daily) */
  const votesOverTimeResult = await database.execute(sql`
    SELECT DATE(created_at) as date, COUNT(*) as total
    FROM votes
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `);

  return NextResponse.json({
    kpi: {
      totalVotes,
      activePolls,
      topOption:
        distribution.sort((a, b) => b.votes - a.votes)[0]?.option ?? "—",
    },
    distribution,
    votesOverTime: votesOverTimeResult.rows, // ✅ THIS FIXES IT
  });
}
