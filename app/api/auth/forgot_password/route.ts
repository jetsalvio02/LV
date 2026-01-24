import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { database } from "@/lib/db";
import { eq } from "drizzle-orm";
import { users } from "@/lib/db/schema";

export async function PATCH(req: Request) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json(
      { message: "Email and password are required." },
      { status: 400 },
    );
  }

  const result = await database
    .select()
    .from(users)
    .where(eq(users.email, email));

  const user = result[0];

  if (!user) {
    return NextResponse.json({ message: "Email not found." }, { status: 404 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await database
    .update(users)
    .set({ password: hashedPassword })
    .where(eq(users.email, email));

  return NextResponse.json({
    message: "Password reset successfully.",
  });
}
