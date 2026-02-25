import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

async function canManage(formId: string, userId: string, role: string) {
  const form = await prisma.form.findUnique({ where: { id: formId } });
  if (!form) return null;
  if (form.deletedAt) return null;
  if (role !== "ADMIN" && form.ownerId !== userId) return undefined;
  return form;
}

export async function GET(_req: Request, { params }: { params: Promise<{ formId: string }> }) {
  const auth = await requireUser();
  if (auth.error) return auth.error;
  const { formId } = await params;

  const full = await prisma.form.findFirst({
    where: { id: formId, deletedAt: null },
    include: { questions: { orderBy: { order: "asc" } } },
  });

  if (!full) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(full);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ formId: string }> }) {
  const auth = await requireUser();
  if (auth.error) return auth.error;
  const { formId } = await params;

  const form = await canManage(formId, auth.user.id, auth.user.role);
  if (form === undefined) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (!form) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const updated = await prisma.form.update({
    where: { id: formId },
    data: {
      title: typeof body.title === "string" ? body.title : undefined,
      description: typeof body.description === "string" ? body.description : undefined,
      formData: typeof body.formData === "object" && body.formData !== null ? body.formData : undefined,
      isActive: typeof body.isActive === "boolean" ? body.isActive : undefined,
      startAt: body.startAt ? new Date(body.startAt) : body.startAt === null ? null : undefined,
      endAt: body.endAt ? new Date(body.endAt) : body.endAt === null ? null : undefined,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ formId: string }> }) {
  const auth = await requireUser();
  if (auth.error) return auth.error;
  const { formId } = await params;

  const form = await canManage(formId, auth.user.id, auth.user.role);
  if (form === undefined) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (!form) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.form.update({
    where: { id: formId },
    data: { deletedAt: new Date(), isActive: false },
  });
  return NextResponse.json({ ok: true });
}
