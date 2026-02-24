import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function GET() {
  const auth = await requireUser();
  if (auth.error) return auth.error;
  if (auth.user.role !== "ADMIN") return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(users);
}
