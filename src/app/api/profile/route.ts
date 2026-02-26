import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function GET() {
  const auth = await requireUser();
  if (auth.error) return auth.error;

  return NextResponse.json({
    id: auth.user.id,
    email: auth.user.email,
    name: auth.user.name,
    role: auth.user.role,
    themePreference: auth.user.themePreference,
  });
}

export async function PATCH(req: Request) {
  const auth = await requireUser();
  if (auth.error) return auth.error;

  const body = await req.json();
  const updated = await prisma.user.update({
    where: { id: auth.user.id },
    data: {
      name: typeof body.name === "string" && body.name.trim() ? body.name.trim() : undefined,
      themePreference:
        body.themePreference === "SYSTEM" || body.themePreference === "LIGHT" || body.themePreference === "DARK"
          ? body.themePreference
          : undefined,
    },
  });

  return NextResponse.json({
    id: updated.id,
    email: updated.email,
    name: updated.name,
    role: updated.role,
    themePreference: updated.themePreference,
  });
}
