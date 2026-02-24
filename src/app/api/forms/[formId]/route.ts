import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ formId: string }> }) {
  const { formId } = await params;

  const form = await prisma.form.findUnique({
    where: { id: formId },
    include: { questions: { orderBy: { order: "asc" } } },
  });

  if (!form) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(form);
}