import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { formatThaiDateTime } from "@/lib/datetime";

function csvEscape(value: string) {
  const v = String(value ?? "");
  if (v.includes(",") || v.includes('"') || v.includes("\n")) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

function htmlEscape(value: string) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export async function GET(req: Request, { params }: { params: Promise<{ formId: string }> }) {
  const auth = await requireUser();
  if (auth.error) return auth.error;

  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format") === "xlsx" ? "xlsx" : "csv";

  const { formId } = await params;
  const form = await prisma.form.findFirst({ where: { id: formId, deletedAt: null }, include: { questions: { orderBy: { order: "asc" } } } });
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
    return [formatThaiDateTime(s.createdAt), ...form.questions.map((q) => byQ.get(q.id) || "")];
  });

  if (format === "xlsx") {
    const tableRows = [headers, ...rows]
      .map((row) => `<tr>${row.map((cell) => `<td>${htmlEscape(String(cell))}</td>`).join("")}</tr>`)
      .join("");

    const html = `\uFEFF<!doctype html><html><head><meta charset="utf-8" /></head><body><table>${tableRows}</table></body></html>`;

    return new NextResponse(html, {
      headers: {
        "Content-Type": "application/vnd.ms-excel; charset=utf-8",
        "Content-Disposition": `attachment; filename=form-${formId}.xlsx`,
      },
    });
  }

  const csv = [headers, ...rows].map((r) => r.map(csvEscape).join(",")).join("\n");
  const csvWithBom = `\uFEFF${csv}`;
  return new NextResponse(csvWithBom, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename=form-${formId}.csv`,
    },
  });
}
