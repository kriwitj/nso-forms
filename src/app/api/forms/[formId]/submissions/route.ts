import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ formId: string }> }) {
  const { formId } = await params;

  const submissions = await prisma.submission.findMany({
    where: { formId },
    orderBy: { createdAt: "desc" },
    include: {
      answers: { include: { question: true } },
    },
  });

  return NextResponse.json(submissions);
}