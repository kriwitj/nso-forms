"use client";

import Breadcrumbs from "@/components/Breadcrumbs";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Form = { id: string; title: string; description: string; isActive: boolean };

export default function DashboardPage() {
  const [forms, setForms] = useState<Form[]>([]);

  async function load() {
    const res = await fetch("/api/forms", { cache: "no-store" });
    if (res.status === 401 || res.status === 403) return (window.location.href = "/login");
    setForms(await res.json());
  }

  useEffect(() => { void load(); }, []);

  const stats = useMemo(() => ({ total: forms.length, active: forms.filter((f) => f.isActive).length }), [forms]);

  async function createForm() {
    const r = await fetch("/api/forms", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: "แบบฟอร์มใหม่" }) });
    const f = await r.json();
    window.location.href = `/forms/${f.id}/builder`;
  }

  async function toggle(form: Form) {
    await fetch(`/api/forms/${form.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !form.isActive }) });
    await load();
  }

  return <main className="max-w-6xl mx-auto p-6">
    <Breadcrumbs items={[{ label: "หน้าแรก", href: "/" }, { label: "แดชบอร์ด" }]} />
    <div className="flex justify-between items-center mb-5"><h1 className="text-2xl font-bold text-sky-900">แดชบอร์ดฟอร์ม</h1><button onClick={createForm} className="bg-sky-600 text-white px-4 py-2 rounded-xl">+ สร้างฟอร์ม</button></div>
    <div className="grid md:grid-cols-2 gap-3 mb-6">
      <div className="bg-white p-4 rounded-xl border border-sky-100">จำนวนฟอร์มทั้งหมด: <b>{stats.total}</b></div>
      <div className="bg-white p-4 rounded-xl border border-sky-100">ฟอร์มที่เปิดใช้งาน: <b>{stats.active}</b></div>
    </div>
    <div className="space-y-3">{forms.map((f) => <div key={f.id} className="bg-white rounded-xl border border-sky-100 p-4">
      <div className="flex flex-col md:flex-row md:justify-between gap-3"><div><h3 className="font-semibold text-sky-900">{f.title}</h3><p className="text-sm text-gray-600">{f.description || "-"}</p></div><div className="flex flex-wrap gap-2">
        <Link className="px-3 py-2 border rounded-lg" href={`/forms/${f.id}/builder`}>แก้ไข</Link>
        <Link className="px-3 py-2 border rounded-lg" href={`/f/${f.id}`}>ตอบแบบฟอร์ม</Link>
        <a className="px-3 py-2 border rounded-lg" href={`/api/forms/${f.id}/export`}>Export Excel</a>
        <button className="px-3 py-2 border rounded-lg" onClick={() => toggle(f)}>{f.isActive ? "ปิดฟอร์ม" : "เปิดฟอร์ม"}</button>
      </div></div>
    </div>)}</div>
  </main>;
}
