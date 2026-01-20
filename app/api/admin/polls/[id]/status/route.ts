import { NextResponse } from "next/server";
import { database } from "@/lib/db";
import { eq } from "drizzle-orm";
import { polls } from "@/lib/db/schema";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const pollId = Number(id);

  if (!id || Number.isNaN(pollId)) {
    return NextResponse.json({ message: "Invalid poll ID" }, { status: 400 });
  }

  const { status } = await req.json();

  if (!["DRAFT", "ACTIVE", "CLOSED"].includes(status)) {
    return NextResponse.json({ message: "Invalid status" }, { status: 400 });
  }

  await database.update(polls).set({ status }).where(eq(polls.id, pollId));

  return NextResponse.json({ success: true });
}
