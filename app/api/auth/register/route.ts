import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { database } from "@/lib/db";
import { users } from "@/lib/db/schema";

export async function POST(req: Request) {
  const { name, email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ message: "Invalid data" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 10);

  await database.insert(users).values({
    name,
    email,
    password: hashed,
  });

  return NextResponse.json({ message: "Registered successfully" });
}
