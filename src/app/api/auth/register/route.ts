import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json();
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const name = String(body.name ?? "").trim();

  if (!email || !password || !name) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return NextResponse.json({ error: "email_exists" }, { status: 409 });

  const totalUsers = await prisma.user.count();
  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash: hashPassword(password),
      role: totalUsers === 0 ? "ADMIN" : "USER",
      isApproved: totalUsers === 0,
    },
  });

  return NextResponse.json({ id: user.id, pendingApproval: !user.isApproved });
}
