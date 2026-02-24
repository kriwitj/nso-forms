import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ formId: string }> }) {
  const { formId } = await params;
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