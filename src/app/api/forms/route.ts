import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function GET() {
  const auth = await requireUser();
  if (auth.error) return auth.error;

  const where = auth.user.role === "ADMIN" ? {} : { ownerId: auth.user.id };
  const forms = await prisma.form.findMany({ where, orderBy: { createdAt: "desc" } });
  return NextResponse.json(forms);
}

export async function POST(req: Request) {
  const auth = await requireUser();
  if (auth.error) return auth.error;

  const body = await req.json();
  const form = await prisma.form.create({
    data: {
      ownerId: auth.user.id,
      title: body.title || "แบบฟอร์มใหม่",
      description: body.description || "",
    },
  });

  return NextResponse.json(form);
}
