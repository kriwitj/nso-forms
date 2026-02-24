import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, requireUser } from "@/lib/auth";

export async function GET() {
  const auth = await requireUser();
  if (auth.error) return auth.error;
  if (auth.user.role !== "ADMIN") return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(users);
}

export async function POST(req: Request) {
  const auth = await requireUser();
  if (auth.error) return auth.error;
  if (auth.user.role !== "ADMIN") return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = await req.json();
  const email = String(body.email ?? "").trim().toLowerCase();
  const name = String(body.name ?? "").trim();
  const password = String(body.password ?? "");
  const role = body.role === "ADMIN" ? "ADMIN" : "USER";
  const isApproved = body.isApproved !== false;

  if (!email || !name || password.length < 6) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const created = await prisma.user.create({
    data: {
      email,
      name,
      role,
      isApproved,
      passwordHash: hashPassword(password),
    },
  });

  return NextResponse.json(created);
}
