import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export type AuthUser = {
  userId: number;
  role: "ADMIN" | "USER";
};

export async function requireAdmin(): Promise<AuthUser> {
  const cookiesStore = await cookies();
  const token = cookiesStore.get("token")?.value;

  if (!token) {
    throw new Error("UNAUTHORIZED");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthUser;

    if (decoded.role !== "ADMIN") {
      throw new Error("FORBIDDEN");
    }

    return decoded;
  } catch {
    throw new Error("UNAUTHORIZED");
  }
}
