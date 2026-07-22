import { jwtVerify } from "jose";
import { NextRequest } from "next/server";

const ADMIN_JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET ?? "fitcoach-admin-secret-2026"
);

export interface AdminJWTPayload {
  email: string;
  adminId: string;
}

export async function verifyAdminSession(
  request: NextRequest
): Promise<AdminJWTPayload | null> {
  const cookie = request.cookies.get("admin-session");
  if (!cookie?.value) return null;

  try {
    const { payload } = await jwtVerify(cookie.value, ADMIN_JWT_SECRET);
    return payload as unknown as AdminJWTPayload;
  } catch {
    return null;
  }
}
