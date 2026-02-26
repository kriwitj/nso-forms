"use client";

import Breadcrumbs from "@/components/Breadcrumbs";
import Toast, { useToast } from "@/components/ui/Toast";
import { formatThaiDateTime } from "@/lib/datetime";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Form = {
  id: string;
  title: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  startAt: string | null;
  endAt: string | null;
  _count: { submissions: number };
};

type SortField = "createdAt" | "title";
type SortOrder = "asc" | "desc";

const PAGE_LIMITS = [10, 20, 50, 100];

export default function DashboardPage() {
  const [forms, setForms] = useState<Form[]>([]);
  const [summary, setSummary] = useState({ totalVisible: 0, activeVisible: 0 });
  const [loading, setLoading] = useState(false);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const { msg, show } = useToast();

  async function load() {
    setLoading(true);
    try {
      const qs = new URLSearchParams({
        limit: String(limit),
        sortField,
        sortOrder,
      });

      if (search.trim()) qs.set("search", search.trim());
      if (status !== "all") qs.set("status", status);

      const res = await fetch(`/api/forms?${qs.toString()}`, { cache: "no-store" });
      if (res.status === 401 || res.status === 403) return (window.location.href = "/login");
      if (!res.ok) throw new Error("โหลดฟอร์มไม่สำเร็จ");
      const payload = await res.json();
      setForms(Array.isArray(payload) ? payload : payload.items || []);
      setSummary(Array.isArray(payload) ? { totalVisible: payload.length, activeVisible: payload.filter((f: Form) => f.isActive).length } : payload.summary || { totalVisible: 0, activeVisible: 0 });
    } catch {
      show("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [limit, sortField, sortOrder, status]);

  const stats = useMemo(() => ({ total: summary.totalVisible, active: summary.activeVisible }), [summary]);

  async function createForm() {
    try {
      const r = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "แบบฟอร์มใหม่" }),
      });
      if (!r.ok) throw new Error();
      const f = await r.json();
      window.location.href = `/forms/${f.id}/builder`;
    } catch {
      show("สร้างฟอร์มไม่สำเร็จ");
    }
  }

  async function toggle(form: Form) {
    try {
      const r = await fetch(`/api/forms/${form.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !form.isActive }),
      });
      if (!r.ok) throw new Error();
      show(form.isActive ? "ปิดฟอร์มแล้ว" : "เปิดฟอร์มแล้ว");
      await load();
    } catch {
      show("เปลี่ยนสถานะฟอร์มไม่สำเร็จ");
    }
  }

  async function softDelete(form: Form) {
    if (!window.confirm(`ยืนยันย้าย "${form.title}" ไปถังขยะ?`)) return;
    try {
      const r = await fetch(`/api/forms/${form.id}`, { method: "DELETE" });
      if (!r.ok) throw new Error();
      show("ย้ายแบบฟอร์มไปถังขยะแล้ว");
      await load();
    } catch {
      show("ลบฟอร์มไม่สำเร็จ");
    }
  }

  return (
    <main className="max-w-6xl mx-auto p-6">
      <Breadcrumbs items={[{ label: "หน้าแรก", href: "/" }, { label: "แดชบอร์ด" }]} />
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-bold text-sky-900 dark:text-sky-200">แดชบอร์ดฟอร์ม</h1>
        <button onClick={createForm} className="bg-sky-600 text-white px-4 py-2 rounded-xl">+ สร้างฟอร์ม</button>
      </div>

      <div className="grid md:grid-cols-2 gap-3 mb-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-sky-100 dark:border-slate-700">จำนวนฟอร์มล่าสุด: <b>{stats.total}</b></div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-sky-100 dark:border-slate-700">ฟอร์มที่เปิดใช้งาน: <b>{stats.active}</b></div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-sky-100 dark:border-slate-700 rounded-xl p-4 mb-4 flex flex-wrap gap-3 items-end">
        <label className="text-sm">ค้นหาชื่อฟอร์ม
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="พิมพ์ชื่อฟอร์ม" className="block border border-sky-200 dark:border-slate-600 rounded px-3 py-2 mt-1 min-w-56 dark:bg-slate-800" />
        </label>

        <label className="text-sm">สถานะ
          <select value={status} onChange={(e) => setStatus(e.target.value as "all" | "active" | "inactive")} className="block border border-sky-200 dark:border-slate-600 rounded px-3 py-2 mt-1 dark:bg-slate-800">
            <option value="all">ทั้งหมด</option>
            <option value="active">เปิดใช้งาน</option>
            <option value="inactive">ปิดใช้งาน</option>
          </select>
        </label>

        <label className="text-sm">จำนวนล่าสุด
          <select value={limit} onChange={(e) => setLimit(Number(e.target.value))} className="block border border-sky-200 dark:border-slate-600 rounded px-3 py-2 mt-1 dark:bg-slate-800">
            {PAGE_LIMITS.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </label>

        <label className="text-sm">เรียงตาม
          <select value={sortField} onChange={(e) => setSortField(e.target.value as SortField)} className="block border border-sky-200 dark:border-slate-600 rounded px-3 py-2 mt-1 dark:bg-slate-800">
            <option value="createdAt">วันที่สร้าง</option>
            <option value="title">ชื่อฟอร์ม</option>
          </select>
        </label>

        <label className="text-sm">ลำดับ
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as SortOrder)} className="block border border-sky-200 dark:border-slate-600 rounded px-3 py-2 mt-1 dark:bg-slate-800">
            <option value="desc">มากไปน้อย</option>
            <option value="asc">น้อยไปมาก</option>
          </select>
        </label>

        <button onClick={load} className="px-4 py-2 rounded bg-sky-600 text-white">ค้นหา</button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-sky-100 dark:border-slate-700 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-sky-50 dark:bg-slate-800 text-sky-900 dark:text-sky-200">
            <tr>
              <th className="text-left p-3">ลำดับ</th>
              <th className="text-left p-3">ชื่อฟอร์ม</th>
              <th className="text-left p-3">สถานะ</th>
              <th className="text-left p-3">ผู้ตอบ</th>
              <th className="text-left p-3">วันที่สร้าง</th>
              <th className="text-left p-3">วันที่ใช้งาน</th>
              <th className="text-left p-3">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {forms.map((f, i) => (
              <tr key={f.id} className="border-t">
                <td className="p-3">{i + 1}</td>
                <td className="p-3">
                  <p className="font-semibold text-sky-900 dark:text-sky-100">{f.title}</p>
                  <p className="text-gray-500 dark:text-slate-400">{f.description || "-"}</p>
                </td>
                <td className="p-3">
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${f.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {f.isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                  </span>
                </td>
                <td className="p-3">{f._count?.submissions ?? 0}</td>
                <td className="p-3">{formatThaiDateTime(f.createdAt)}</td>
                <td className="p-3">{f.startAt || f.endAt ? `${f.startAt ? formatThaiDateTime(f.startAt) : "-"} - ${f.endAt ? formatThaiDateTime(f.endAt) : "-"}` : "ไม่กำหนด"}</td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-2">
                    <Link className="px-3 py-1 border rounded" href={`/forms/${f.id}/builder`}>แก้ไข</Link>
                    <Link className="px-3 py-1 border rounded" href={`/f/${f.id}`}>ตอบ</Link>
                    <a className="px-3 py-1 border rounded" href={`/api/forms/${f.id}/export?format=csv`}>CSV</a>
                    <a className="px-3 py-1 border rounded" href={`/api/forms/${f.id}/export?format=xls`}>Excel</a>
                    <button className="px-3 py-1 border rounded" onClick={() => toggle(f)}>{f.isActive ? "ปิด" : "เปิด"}</button>
                    <button className="px-3 py-1 rounded bg-red-50 text-red-700" onClick={() => softDelete(f)}>ลบ</button>
                  </div>
                </td>
              </tr>
            ))}
            {!forms.length && (
              <tr>
                <td className="p-6 text-center text-gray-500 dark:text-slate-400" colSpan={7}>{loading ? "กำลังโหลด..." : "ไม่พบข้อมูล"}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Toast message={msg} />
    </main>
  );
}
