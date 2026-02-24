import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

function csvEscape(value: string) {
  const v = String(value ?? "");
  if (v.includes(",") || v.includes('"') || v.includes("\n")) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

export async function GET(_req: Request, { params }: { params: Promise<{ formId: string }> }) {
  const auth = await requireUser();
  if (auth.error) return auth.error;

  const { formId } = await params;
  const form = await prisma.form.findUnique({ where: { id: formId }, include: { questions: { orderBy: { order: "asc" } } } });
  if (!form) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (auth.user.role !== "ADMIN" && form.ownerId !== auth.user.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const submissions = await prisma.submission.findMany({
    where: { formId },
    include: { answers: true },
    orderBy: { createdAt: "asc" },
  });

  const headers = ["submittedAt", ...form.questions.map((q) => q.text)];
  const rows = submissions.map((s) => {
    const byQ = new Map(s.answers.map((a) => [a.questionId, a.value]));
    return [s.createdAt.toISOString(), ...form.questions.map((q) => byQ.get(q.id) || "")];
  });

  const csv = [headers, ...rows].map((r) => r.map(csvEscape).join(",")).join("\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename=form-${formId}.csv`,
    },
  });
}
