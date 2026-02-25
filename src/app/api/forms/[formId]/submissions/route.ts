import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function GET(_req: Request, { params }: { params: Promise<{ formId: string }> }) {
  const auth = await requireUser();
  if (auth.error) return auth.error;

  const { formId } = await params;
  const form = await prisma.form.findFirst({ where: { id: formId, deletedAt: null } });
  if (!form) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (auth.user.role !== "ADMIN" && form.ownerId !== auth.user.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const submissions = await prisma.submission.findMany({
    where: { formId },
    orderBy: { createdAt: "desc" },
    include: { answers: { include: { question: true } } },
  });

  return NextResponse.json(submissions);
}
