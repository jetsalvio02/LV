import { NextResponse } from "next/server";
import { database } from "@/lib/db";
import { polls, poll_options } from "@/lib/db/schema";
import { saveFile } from "@/lib/upload";
import { InferInsertModel } from "drizzle-orm";

/* ======================
   TYPES
====================== */

type PollType = "YES_NO" | "MULTIPLE_CHOICE";
type PollStatus = "DRAFT" | "ACTIVE" | "CLOSED";

type NewPoll = InferInsertModel<typeof polls>;
type NewPollOption = InferInsertModel<typeof poll_options>;

/* ======================
   POST: CREATE POLL
====================== */

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    /* ======================
       BASIC FIELDS
    ====================== */
    const title = formData.get("title") as string | null;
    const description = formData.get("description") as string | null;
    const type = formData.get("type") as PollType | null;
    const status = formData.get("status") as PollStatus | null;

    if (!title || !type || !status) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 },
      );
    }

    /* ======================
       POLL IMAGE
    ====================== */
    let pollImageUrl: string | null = null;

    const pollImage = formData.get("poll_image");
    if (pollImage instanceof File && pollImage.size > 0) {
      pollImageUrl = await saveFile(pollImage);
    }

    /* ======================
       INSERT POLL
    ====================== */
    const pollData: NewPoll = {
      title,
      description,
      type,
      status,
      image_url: pollImageUrl,
    };

    const [createdPoll] = await database
      .insert(polls)
      .values([pollData]) // required for enum safety
      .returning();

    /* ======================
       OPTIONS: YES / NO
    ====================== */
    if (type === "YES_NO") {
      const yesNoOptions: NewPollOption[] = [
        {
          poll_id: createdPoll.id,
          label: "YES",
          image_url: null,
        },
        {
          poll_id: createdPoll.id,
          label: "NO",
          image_url: null,
        },
      ];

      await database.insert(poll_options).values(yesNoOptions);
    }

    /* ======================
       OPTIONS: MULTIPLE CHOICE
    ====================== */
    if (type === "MULTIPLE_CHOICE") {
      const optionsMap: Record<number, { label?: string; image?: File }> = {};

      for (const [key, value] of formData.entries()) {
        const match = key.match(/options\[(\d+)\]\[(label|image)\]/);
        if (!match) continue;

        const index = Number(match[1]);
        const field = match[2];

        if (!optionsMap[index]) {
          optionsMap[index] = {};
        }

        if (field === "label") {
          optionsMap[index].label = value as string;
        }

        if (field === "image" && value instanceof File) {
          optionsMap[index].image = value;
        }
      }

      for (const option of Object.values(optionsMap)) {
        if (!option.label) continue;

        let optionImageUrl: string | null = null;

        if (option.image && option.image.size > 0) {
          optionImageUrl = await saveFile(option.image);
        }

        const optionData: NewPollOption = {
          poll_id: createdPoll.id,
          label: option.label,
          image_url: optionImageUrl,
        };

        await database.insert(poll_options).values([optionData]);
      }
    }

    /* ======================
       SUCCESS
    ====================== */
    return NextResponse.json({
      success: true,
      poll_id: createdPoll.id,
    });
  } catch (error) {
    console.error("CREATE POLL ERROR:", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
