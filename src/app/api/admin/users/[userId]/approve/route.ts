import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function PATCH(_req: Request, { params }: { params: Promise<{ userId: string }> }) {
  const auth = await requireUser();
  if (auth.error) return auth.error;
  if (auth.user.role !== "ADMIN") return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { userId } = await params;
  const updated = await prisma.user.update({ where: { id: userId }, data: { isApproved: true } });
  return NextResponse.json(updated);
}
