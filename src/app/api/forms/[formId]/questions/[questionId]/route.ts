import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ formId: string; questionId: string }> }
) {
  const { questionId } = await params;
  const body = await req.json();

  const updated = await prisma.question.update({
    where: { id: questionId },
    data: {
      text: typeof body.text === "string" ? body.text : undefined,
      type: typeof body.type === "string" ? body.type : undefined,
      required: typeof body.required === "boolean" ? body.required : undefined,
      order: typeof body.order === "number" ? body.order : undefined,
      options: Array.isArray(body.options) ? body.options : undefined,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ formId: string; questionId: string }> }
) {
  const { questionId } = await params;
  await prisma.question.delete({ where: { id: questionId } });
  return NextResponse.json({ ok: true });
}