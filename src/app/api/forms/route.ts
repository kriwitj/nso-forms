import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

const ALLOWED_LIMITS = new Set([10, 20, 50, 100]);

type SortField = "createdAt" | "title";
type SortOrder = "asc" | "desc";

function parseLimit(value: string | null) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || !ALLOWED_LIMITS.has(parsed)) return 10;
  return parsed;
}

function parseSortField(value: string | null): SortField {
  return value === "title" ? "title" : "createdAt";
}

function parseSortOrder(value: string | null): SortOrder {
  return value === "asc" ? "asc" : "desc";
}

export async function GET(req: Request) {
  const auth = await requireUser();
  if (auth.error) return auth.error;

  const { searchParams } = new URL(req.url);
  const limit = parseLimit(searchParams.get("limit"));
  const sortField = parseSortField(searchParams.get("sortField"));
  const sortOrder = parseSortOrder(searchParams.get("sortOrder"));
  const search = (searchParams.get("search") || "").trim();
  const status = searchParams.get("status");
  const includeDeleted = auth.user.role === "ADMIN" && searchParams.get("includeDeleted") === "true";

  const where: Record<string, unknown> = auth.user.role === "ADMIN" ? {} : { ownerId: auth.user.id };

  if (!includeDeleted) {
    where.deletedAt = null;
  }

  if (search) {
    where.title = { contains: search, mode: "insensitive" };
  }

  if (status === "active") {
    where.isActive = true;
  } else if (status === "inactive") {
    where.isActive = false;
  }

  const baseWhere = { ...where };

  const [totalVisible, activeVisible, forms] = await Promise.all([
    prisma.form.count({ where: baseWhere }),
    prisma.form.count({ where: { ...baseWhere, isActive: true } }),
    prisma.form.findMany({
      where,
      orderBy: { [sortField]: sortOrder },
      take: limit,
      include: {
        _count: { select: { submissions: true } },
      },
    }),
  ]);

  return NextResponse.json({
    items: forms,
    summary: {
      totalVisible,
      activeVisible,
    },
  });
}

export async function POST(req: Request) {
  const auth = await requireUser();
  if (auth.error) return auth.error;

  const body = await req.json();
  const form = await prisma.form.create({
    data: {
      ownerId: auth.user.id,
      title: body.title || "แบบฟอร์มใหม่",
      description: body.description || "",
    },
  });

  return NextResponse.json(form);
}
