import { NextResponse } from "next/server";
import { database } from "@/lib/db";
import { polls, votes, poll_options } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET(
  req: Request,
  context: { params: Promise<{ pollId: string }> },
) {
  const { pollId } = await context.params; // ✅ REQUIRED IN NEXT 15/16
  const pollIdNumber = Number(pollId);

  if (Number.isNaN(pollIdNumber)) {
    return NextResponse.json({ message: "Invalid poll id" }, { status: 400 });
  }

  /* Poll info */
  const [poll] = await database
    .select({
      id: polls.id,
      title: polls.title,
      status: polls.status,
    })
    .from(polls)
    .where(eq(polls.id, pollIdNumber));

  if (!poll) {
    return NextResponse.json({ message: "Poll not found" }, { status: 404 });
  }

  /* Total votes */
  const [{ totalVotes }] = await database
    .select({ totalVotes: sql<number>`count(*)` })
    .from(votes)
    .where(eq(votes.poll_id, pollIdNumber));

  /* Vote distribution */
  const distribution = await database
    .select({
      option: poll_options.label,
      votes: sql<number>`count(${votes.id})`,
    })
    .from(poll_options)
    .leftJoin(
      votes,
      sql`${votes.option_id} = ${poll_options.id}
           AND ${votes.poll_id} = ${pollIdNumber}`,
    )
    .where(eq(poll_options.poll_id, pollIdNumber))
    .groupBy(poll_options.label);

  /* Votes over time */
  const votesOverTimeResult = await database.execute(sql`
    SELECT DATE(created_at) as date, COUNT(*) as total
    FROM votes
    WHERE poll_id = ${pollIdNumber}
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `);

  return NextResponse.json({
    poll,
    kpi: {
      totalVotes,
      topOption:
        distribution.sort((a, b) => b.votes - a.votes)[0]?.option ?? "—",
    },
    distribution,
    votesOverTime: votesOverTimeResult.rows,
  });
}
