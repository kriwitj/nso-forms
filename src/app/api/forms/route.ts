import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  let form = await prisma.form.findFirst({ orderBy: { createdAt: "asc" } });
  if (!form) {
    form = await prisma.form.create({
      data: { title: "แบบฟอร์มใหม่", description: "" },
    });
  }
  return NextResponse.json(form);
}

export async function PATCH(req: Request) {
  const body = await req.json();
  let form = await prisma.form.findFirst({ orderBy: { createdAt: "asc" } });
  if (!form) {
    form = await prisma.form.create({ data: { title: "แบบฟอร์มใหม่" } });
  }
  const updated = await prisma.form.update({
    where: { id: form.id },
    data: {
      title: typeof body.title === "string" ? body.title : undefined,
      description: typeof body.description === "string" ? body.description : undefined,
    },
  });
  return NextResponse.json(updated);
}
