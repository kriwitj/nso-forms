"use client";

import Breadcrumbs from "@/components/Breadcrumbs";
import Toast, { useToast } from "@/components/ui/Toast";
import { useEffect, useState } from "react";

type Profile = {
  id: string;
  email: string;
  name: string;
  role: string;
  themePreference: "SYSTEM" | "LIGHT" | "DARK";
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [themePreference, setThemePreference] = useState<"SYSTEM" | "LIGHT" | "DARK">("SYSTEM");
  const { msg, show } = useToast();

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/profile", { cache: "no-store" });
      if (!res.ok) return (window.location.href = "/login");
      const data = (await res.json()) as Profile;
      setProfile(data);
      setName(data.name);
      setThemePreference(data.themePreference || "SYSTEM");
    })();
  }, []);

  async function saveProfile() {
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, themePreference }),
    });

    if (!res.ok) return show("บันทึกโปรไฟล์ไม่สำเร็จ");
    show("บันทึกโปรไฟล์แล้ว");

    if (themePreference === "DARK") {
      document.documentElement.classList.add("dark");
    } else if (themePreference === "LIGHT") {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.toggle("dark", window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
  }

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <Breadcrumbs items={[{ label: "หน้าแรก", href: "/" }, { label: "โปรไฟล์" }]} />

      <section className="bg-white dark:bg-slate-900 rounded-xl border border-sky-100 dark:border-slate-700 p-6">
        <h1 className="text-2xl font-bold text-sky-900 dark:text-sky-300 mb-4">ตั้งค่าโปรไฟล์</h1>

        <div className="grid gap-4">
          <div>
            <label className="text-sm text-slate-600 dark:text-slate-300">อีเมล</label>
            <input className="w-full border rounded px-3 py-2 mt-1 bg-slate-100 dark:bg-slate-800" value={profile?.email || ""} disabled />
          </div>

          <div>
            <label className="text-sm text-slate-600 dark:text-slate-300">ชื่อแสดงผล</label>
            <input className="w-full border rounded px-3 py-2 mt-1 dark:bg-slate-800" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div>
            <label className="text-sm text-slate-600 dark:text-slate-300">ธีม</label>
            <select className="w-full border rounded px-3 py-2 mt-1 dark:bg-slate-800" value={themePreference} onChange={(e) => setThemePreference(e.target.value as "SYSTEM" | "LIGHT" | "DARK")}>
              <option value="SYSTEM">ตามระบบ (ค่าเริ่มต้น)</option>
              <option value="LIGHT">สว่าง</option>
              <option value="DARK">มืด</option>
            </select>
          </div>

          <button onClick={saveProfile} className="justify-self-start px-4 py-2 rounded bg-sky-600 text-white">บันทึกการตั้งค่า</button>
        </div>
      </section>

      <Toast message={msg} />
    </main>
  );
}
