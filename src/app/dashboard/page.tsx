"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Form = { id: string; title: string; description: string; isActive: boolean; startAt: string | null; endAt: string | null };

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

  async function remove(id: string) {
    await fetch(`/api/forms/${id}`, { method: "DELETE" });
    await load();
  }

  return <main className="max-w-5xl mx-auto p-6">
    <div className="flex justify-between items-center mb-5"><h1 className="text-2xl font-bold">Dashboard</h1><button onClick={createForm} className="bg-purple-600 text-white px-4 py-2 rounded">+ สร้างฟอร์ม</button></div>
    <div className="grid grid-cols-2 gap-3 mb-6">
      <div className="bg-white p-4 rounded shadow">จำนวนฟอร์มทั้งหมด: <b>{stats.total}</b></div>
      <div className="bg-white p-4 rounded shadow">ฟอร์มที่เปิดใช้งาน: <b>{stats.active}</b></div>
    </div>
    <div className="space-y-3">{forms.map((f) => <div key={f.id} className="bg-white rounded shadow p-4">
      <div className="flex justify-between"><div><h3 className="font-semibold">{f.title}</h3><p className="text-sm text-gray-600">{f.description || "-"}</p></div><div className="space-x-2">
        <Link className="px-2 py-1 border rounded" href={`/forms/${f.id}/builder`}>แก้ไข</Link>
        <Link className="px-2 py-1 border rounded" href={`/f/${f.id}`}>ตอบแบบฟอร์ม</Link>
        <a className="px-2 py-1 border rounded" href={`/api/forms/${f.id}/export`}>Export Excel(CSV)</a>
        <button className="px-2 py-1 border rounded" onClick={() => toggle(f)}>{f.isActive ? "ปิด" : "เปิด"}</button>
        <button className="px-2 py-1 border rounded text-red-600" onClick={() => remove(f.id)}>ลบ</button>
      </div></div>
    </div>)}</div>
  </main>;
}
