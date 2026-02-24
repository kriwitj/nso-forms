"use client";

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

  return <main className="max-w-5xl mx-auto p-6 space-y-6">
    <h1 className="text-2xl font-bold">Admin หลังบ้าน</h1>
    <section className="bg-white p-4 rounded shadow"><h2 className="font-semibold mb-2">ผู้ใช้งานทั้งหมด</h2>
      {users.map((u) => <div key={u.id} className="flex justify-between border-b py-2"><span>{u.name} ({u.email}) - {u.role}</span>{u.isApproved ? <span className="text-green-700">อนุมัติแล้ว</span> : <button className="text-purple-700" onClick={() => approve(u.id)}>อนุมัติ</button>}</div>)}
    </section>
    <section className="bg-white p-4 rounded shadow"><h2 className="font-semibold mb-2">ฟอร์มทั้งหมด ({forms.length})</h2>
      {forms.map((f) => <div key={f.id} className="border-b py-2">{f.title} - {f.isActive ? "เปิด" : "ปิด"}</div>)}
    </section>
  </main>;
}
