"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    setPending(q.get("pending") === "1");
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const r = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await r.json();
    if (!r.ok) return setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    if (!data.isApproved) return setError("บัญชียังไม่ผ่านการอนุมัติจากแอดมิน");
    router.push(data.role === "ADMIN" ? "/admin" : "/dashboard");
  }

  return (
    <main className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl p-8 border border-sky-100 shadow-sm">
        <h1 className="text-3xl font-bold text-sky-900 mb-2">เข้าสู่ระบบ</h1>
        <p className="text-slate-500 mb-6">ยินดีต้อนรับเข้าสู่ NSO Forms</p>
        {pending && <p className="text-amber-700 mb-3">บัญชีของคุณรอการอนุมัติจากผู้ดูแล</p>}
        {error && <p className="text-red-600 mb-3">{error}</p>}
        <form className="space-y-4" onSubmit={onSubmit}>
          <input className="w-full border border-sky-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-300" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="w-full border border-sky-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-300" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button className="w-full bg-sky-600 hover:bg-sky-700 text-white p-3 rounded-xl font-medium">เข้าสู่ระบบ</button>
        </form>
        <p className="mt-4 text-sm">ยังไม่มีบัญชี? <Link className="text-sky-700 hover:underline" href="/register">สมัครสมาชิก</Link></p>
      </div>
    </main>
  );
}
