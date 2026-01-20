import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(req: Request) {
  const token = req.headers.get("cookie")?.split("token=")[1];

  if (!token) {
    return NextResponse.json({ loggedIn: false });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    return NextResponse.json({ loggedIn: true, user: decoded });
  } catch {
    return NextResponse.json({ loggedIn: false });
  }
}
