import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, requireUser } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ userId: string }> }) {
  const auth = await requireUser();
  if (auth.error) return auth.error;
  if (auth.user.role !== "ADMIN") return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { userId } = await params;
  const body = await req.json();

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      name: typeof body.name === "string" ? body.name.trim() : undefined,
      role: body.role === "ADMIN" || body.role === "USER" ? body.role : undefined,
      themePreference: body.themePreference === "SYSTEM" || body.themePreference === "LIGHT" || body.themePreference === "DARK" ? body.themePreference : undefined,
      isApproved: typeof body.isApproved === "boolean" ? body.isApproved : undefined,
      passwordHash: typeof body.password === "string" && body.password.length >= 6 ? hashPassword(body.password) : undefined,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ userId: string }> }) {
  const auth = await requireUser();
  if (auth.error) return auth.error;
  if (auth.user.role !== "ADMIN") return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { userId } = await params;
  if (userId === auth.user.id) return NextResponse.json({ error: "cannot_delete_self" }, { status: 400 });

  await prisma.user.delete({ where: { id: userId } });
  return NextResponse.json({ ok: true });
}
