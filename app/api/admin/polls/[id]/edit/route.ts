import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { saveFile } from "@/lib/upload";
import { database } from "@/lib/db";
import { polls, poll_options } from "@/lib/db/schema";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const pollId = Number(id);

  if (!Number.isInteger(pollId)) {
    return NextResponse.json({ message: "Invalid poll ID" }, { status: 400 });
  }

  type PollType = "YES_NO" | "MULTIPLE_CHOICE";
  type PollStatus = "DRAFT" | "ACTIVE" | "CLOSED";

  const formData = await req.formData();

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const type = formData.get("type") as PollType;
  const status = formData.get("status") as PollStatus;
  const pollImage = formData.get("poll_image") as File | null;

  let pollImageUrl: string | undefined;

  if (pollImage && pollImage.size > 0) {
    pollImageUrl = await saveFile(pollImage);
  }

  await database
    .update(polls)
    .set({
      title,
      description,
      type,
      status,
      ...(pollImageUrl && { image_url: pollImageUrl }),
    })
    .where(eq(polls.id, pollId));

  if (type === "MULTIPLE_CHOICE") {
    await database.delete(poll_options).where(eq(poll_options.poll_id, pollId));

    let index = 0;
    while (formData.get(`options[${index}][label]`)) {
      const label = formData.get(`options[${index}][label]`) as string;
      const image = formData.get(`options[${index}][image]`) as File | null;

      let imageUrl: string | undefined;
      if (image && image.size > 0) {
        imageUrl = await saveFile(image);
      }

      await database.insert(poll_options).values({
        poll_id: pollId,
        label,
        image_url: imageUrl,
      });

      index++;
    }
  }

  return NextResponse.json({ success: true });
}
