// import { NextResponse } from "next/server";
// import { cookies } from "next/headers";

// export async function POST() {
//   const cookiesStore = await cookies();

//   cookiesStore.delete("user_id");

//   return NextResponse.json({ message: "Logged out" });
// }
import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });

  response.cookies.set("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0, // DELETE COOKIE
  });

  return response;
}
