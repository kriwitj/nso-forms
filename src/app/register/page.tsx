"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await r.json();
    if (!r.ok) return setMsg("สมัครสมาชิกไม่สำเร็จ อีเมลอาจถูกใช้แล้ว");
    setMsg(data.pendingApproval ? "สมัครสำเร็จ รอแอดมินอนุมัติ" : "สมัครสำเร็จ");
    setTimeout(() => router.push("/login"), 1200);
  }

  return (
    <main className="max-w-md mx-auto p-6 mt-16 bg-white rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-4">สมัครสมาชิก</h1>
      {msg && <p className="mb-2 text-green-700">{msg}</p>}
      <form className="space-y-3" onSubmit={onSubmit}>
        <input className="w-full border p-2 rounded" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="w-full border p-2 rounded" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full border p-2 rounded" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="w-full bg-purple-600 text-white p-2 rounded">Register</button>
      </form>
      <p className="mt-3 text-sm"><Link className="text-purple-700" href="/login">กลับไปหน้า Login</Link></p>
    </main>
  );
}
