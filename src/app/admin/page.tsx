"use client";

import Breadcrumbs from "@/components/Breadcrumbs";
import { useEffect, useState } from "react";

type User = { id: string; name: string; email: string; role: string; isApproved: boolean };
type Form = { id: string; title: string; ownerId: string; isActive: boolean };

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [forms, setForms] = useState<Form[]>([]);

  async function load() {
    const u = await fetch("/api/admin/users", { cache: "no-store" });
    if (!u.ok) return (window.location.href = "/login");
    setUsers(await u.json());
    const f = await fetch("/api/forms", { cache: "no-store" });
    setForms(await f.json());
  }

  useEffect(() => { void load(); }, []);

  async function approve(userId: string) {
    await fetch(`/api/admin/users/${userId}/approve`, { method: "PATCH" });
    await load();
  }

  return <main className="max-w-6xl mx-auto p-6 space-y-6">
    <Breadcrumbs items={[{ label: "หน้าแรก", href: "/" }, { label: "จัดการระบบ" }]} />
    <h1 className="text-2xl font-bold text-sky-900">Admin Console</h1>
    <section className="bg-white p-4 rounded-xl border border-sky-100"><h2 className="font-semibold mb-3">จัดการผู้ใช้งาน</h2>
      <div className="space-y-2">
        {users.map((u) => <div key={u.id} className="flex flex-col md:flex-row md:justify-between md:items-center border rounded-lg p-3 bg-slate-50">
          <span>{u.name} ({u.email}) - {u.role}</span>
          {u.isApproved ? <span className="text-green-700">อนุมัติแล้ว</span> : <button className="px-3 py-1 rounded-lg bg-sky-600 text-white" onClick={() => approve(u.id)}>อนุมัติการใช้งาน</button>}
        </div>)}
      </div>
    </section>
    <section className="bg-white p-4 rounded-xl border border-sky-100"><h2 className="font-semibold mb-3">จัดการฟอร์มทั้งหมด ({forms.length})</h2>
      <div className="space-y-2">{forms.map((f) => <div key={f.id} className="border rounded-lg p-3 bg-slate-50">{f.title} - {f.isActive ? "เปิด" : "ปิด"}</div>)}</div>
    </section>
  </main>;
}
