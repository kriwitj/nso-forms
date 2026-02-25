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
    <main className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-sky-100 dark:border-slate-700 shadow-sm">
        <h1 className="text-3xl font-bold text-sky-900 dark:text-sky-200 mb-2">สมัครสมาชิก</h1>
        <p className="text-slate-500 dark:text-slate-300 mb-6">สร้างบัญชีเพื่อใช้งานระบบ</p>
        {msg && <p className="mb-3 text-green-700">{msg}</p>}
        <form className="space-y-4" onSubmit={onSubmit}>
          <input className="w-full border border-sky-200 dark:border-slate-600 dark:bg-slate-800 p-3 rounded-xl" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="w-full border border-sky-200 dark:border-slate-600 dark:bg-slate-800 p-3 rounded-xl" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="w-full border border-sky-200 dark:border-slate-600 dark:bg-slate-800 p-3 rounded-xl" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button className="w-full bg-sky-600 hover:bg-sky-700 text-white p-3 rounded-xl font-medium">สมัครสมาชิก</button>
        </form>
        <p className="mt-4 text-sm"><Link className="text-sky-700 dark:text-sky-200 hover:underline" href="/login">กลับไปหน้า Login</Link></p>
      </div>
    </main>
  );
}
