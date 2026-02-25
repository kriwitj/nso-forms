"use client";

import Breadcrumbs from "@/components/Breadcrumbs";
import { useEffect, useState } from "react";

type User = { id: string; name: string; email: string; role: string; isApproved: boolean };
type Form = { id: string; title: string; ownerId: string; isActive: boolean };

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [forms, setForms] = useState<Form[]>([]);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "USER", isApproved: true });

  async function load() {
    const u = await fetch("/api/admin/users", { cache: "no-store" });
    if (!u.ok) return (window.location.href = "/login");
    setUsers(await u.json());
    const f = await fetch("/api/forms?limit=100&includeDeleted=true", { cache: "no-store" });
    const payload = await f.json();
    setForms(Array.isArray(payload) ? payload : payload.items || []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function approve(userId: string) {
    await fetch(`/api/admin/users/${userId}/approve`, { method: "PATCH" });
    await load();
  }

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    });
    setNewUser({ name: "", email: "", password: "", role: "USER", isApproved: true });
    await load();
  }

  async function updateUser(user: User) {
    const name = prompt("ชื่อผู้ใช้", user.name);
    if (!name) return;
    const role = prompt("Role (ADMIN/USER)", user.role) === "ADMIN" ? "ADMIN" : "USER";
    await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, role }),
    });
    await load();
  }

  async function deleteUser(userId: string) {
    if (!confirm("ยืนยันลบผู้ใช้?")) return;
    await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
    await load();
  }

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-6">
      <Breadcrumbs items={[{ label: "หน้าแรก", href: "/" }, { label: "จัดการระบบ" }]} />
      <h1 className="text-2xl font-bold text-sky-900">Admin Console</h1>

      <section className="bg-white p-4 rounded-xl border border-sky-100">
        <h2 className="font-semibold mb-3">เพิ่มผู้ใช้งาน</h2>
        <form onSubmit={createUser} className="grid md:grid-cols-5 gap-2">
          <input className="border rounded px-2 py-2" placeholder="name" value={newUser.name} onChange={(e) => setNewUser((p) => ({ ...p, name: e.target.value }))} />
          <input className="border rounded px-2 py-2" placeholder="email" value={newUser.email} onChange={(e) => setNewUser((p) => ({ ...p, email: e.target.value }))} />
          <input className="border rounded px-2 py-2" type="password" placeholder="password" value={newUser.password} onChange={(e) => setNewUser((p) => ({ ...p, password: e.target.value }))} />
          <select className="border rounded px-2 py-2" value={newUser.role} onChange={(e) => setNewUser((p) => ({ ...p, role: e.target.value }))}>
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
          <button className="bg-sky-600 text-white rounded px-3 py-2">Create</button>
        </form>
      </section>

      <section className="bg-white p-4 rounded-xl border border-sky-100">
        <h2 className="font-semibold mb-3">จัดการผู้ใช้งาน (CRUD)</h2>
        <div className="space-y-2">
          {users.map((u) => (
            <div key={u.id} className="flex flex-col md:flex-row md:justify-between md:items-center border rounded-lg p-3 bg-slate-50 gap-2">
              <span>
                {u.name} ({u.email}) - {u.role}
              </span>
              <div className="flex gap-2 flex-wrap">
                {u.isApproved ? <span className="text-green-700">อนุมัติแล้ว</span> : <button className="px-3 py-1 rounded-lg bg-sky-600 text-white" onClick={() => approve(u.id)}>อนุมัติ</button>}
                <button className="px-3 py-1 rounded-lg bg-amber-100 text-amber-800" onClick={() => updateUser(u)}>แก้ไข</button>
                <button className="px-3 py-1 rounded-lg bg-red-100 text-red-700" onClick={() => deleteUser(u.id)}>ลบ</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white p-4 rounded-xl border border-sky-100">
        <h2 className="font-semibold mb-3">จัดการฟอร์มทั้งหมด ({forms.length})</h2>
        <div className="space-y-2">
          {forms.map((f) => (
            <div key={f.id} className="border rounded-lg p-3 bg-slate-50">
              {f.title} - {f.isActive ? "เปิด" : "ปิด"}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
