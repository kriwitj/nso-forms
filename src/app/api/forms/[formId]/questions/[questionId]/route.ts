import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

async function checkAccess(formId: string, userId: string, role: string) {
  const form = await prisma.form.findUnique({ where: { id: formId } });
  if (!form) return null;
  if (role !== "ADMIN" && form.ownerId !== userId) return undefined;
  return form;
}

export async function PATCH(req: Request, { params }: { params: Promise<{ formId: string; questionId: string }> }) {
  const auth = await requireUser();
  if (auth.error) return auth.error;

  const { formId, questionId } = await params;
  const form = await checkAccess(formId, auth.user.id, auth.user.role);
  if (form === undefined) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (!form) return NextResponse.json({ error: "Not found" }, { status: 404 });

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

export async function DELETE(_req: Request, { params }: { params: Promise<{ formId: string; questionId: string }> }) {
  const auth = await requireUser();
  if (auth.error) return auth.error;

  const { formId, questionId } = await params;
  const form = await checkAccess(formId, auth.user.id, auth.user.role);
  if (form === undefined) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (!form) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.question.delete({ where: { id: questionId } });
  return NextResponse.json({ ok: true });
}
