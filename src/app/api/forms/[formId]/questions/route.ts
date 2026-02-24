import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: Promise<{ formId: string }> }) {
  const auth = await requireUser();
  if (auth.error) return auth.error;

  const { formId } = await params;
  const form = await prisma.form.findUnique({ where: { id: formId } });
  if (!form) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (auth.user.role !== "ADMIN" && form.ownerId !== auth.user.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const count = await prisma.question.count({ where: { formId } });

  const q = await prisma.question.create({
    data: {
      formId,
      text: body.text ?? "คำถามใหม่",
      type: body.type ?? "short",
      options: Array.isArray(body.options) ? body.options : [],
      required: !!body.required,
      order: count,
    },
  });

  return NextResponse.json(q);
}
