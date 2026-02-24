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
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search);
      setPending(q.get("pending") === "1");
    }
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
    <main className="max-w-md mx-auto p-6 mt-16 bg-white rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-4">เข้าสู่ระบบ</h1>
      {pending && <p className="text-amber-700 mb-2">บัญชีของคุณรอการอนุมัติจากผู้ดูแล</p>}
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <form className="space-y-3" onSubmit={onSubmit}>
        <input className="w-full border p-2 rounded" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full border p-2 rounded" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="w-full bg-purple-600 text-white p-2 rounded">Login</button>
      </form>
      <p className="mt-3 text-sm">ยังไม่มีบัญชี? <Link className="text-purple-700" href="/register">สมัครสมาชิก</Link></p>
    </main>
  );
}
