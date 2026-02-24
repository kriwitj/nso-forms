import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ formId: string }> }) {
  const { formId } = await params;
  const body = await req.json();
  const answers = body?.answers ?? {};

  const questions = await prisma.question.findMany({
    where: { formId },
    orderBy: { order: "asc" },
  });

  const requiredMissing = questions.filter(
    (q) => q.required && !String(answers[q.id] ?? "").trim()
  );
  if (requiredMissing.length > 0) {
    return NextResponse.json({ error: "missing_required" }, { status: 400 });
  }

  const submission = await prisma.submission.create({
    data: {
      formId,
      answers: {
        create: questions.map((q) => ({
          questionId: q.id,
          value: String(answers[q.id] ?? ""),
        })),
      },
    },
    include: { answers: true },
  });

  return NextResponse.json(submission);
}