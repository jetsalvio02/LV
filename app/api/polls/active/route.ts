import { NextResponse } from "next/server";
import { database } from "@/lib/db";
import { polls, poll_options } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  // fetch all active polls
  const activePolls = await database
    .select()
    .from(polls)
    .where(eq(polls.status, "ACTIVE"));

  // attach options for each poll
  const pollsWithOptions = await Promise.all(
    activePolls.map(async (poll) => {
      const options = await database
        .select()
        .from(poll_options)
        .where(eq(poll_options.poll_id, poll.id));

      return {
        id: poll.id,
        title: poll.title,
        description: poll.description,
        type: poll.type,
        status: poll.status,
        image_url: poll.image_url,
        options,
      };
    }),
  );

  return NextResponse.json(pollsWithOptions);
}
