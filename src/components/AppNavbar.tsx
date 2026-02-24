"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type Me = { id: string; name: string; role: string; isApproved: boolean } | null;

export default function AppNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [me, setMe] = useState<Me>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const data = await res.json();
      setMe(data.user);
    })();
  }, [pathname]);

  const menus = useMemo(() => {
    const common = [{ label: "หน้าแรก", href: "/" }];
    if (!me) return [...common, { label: "เข้าสู่ระบบ", href: "/login" }, { label: "สมัครสมาชิก", href: "/register" }];
    const userMenus = [...common, { label: "แดชบอร์ด", href: "/dashboard" }];
    if (me.role === "ADMIN") userMenus.push({ label: "จัดการระบบ", href: "/admin" });
    return userMenus;
  }, [me]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-sky-100 bg-white/90 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <Link href="/" className="font-bold text-sky-700 text-xl">nso-forms</Link>
        <nav className="flex items-center gap-2">
          {menus.map((m) => (
            <Link key={m.href} href={m.href} className={`px-3 py-2 rounded-lg text-sm ${pathname === m.href ? "bg-sky-100 text-sky-800" : "text-sky-700 hover:bg-sky-50"}`}>
              {m.label}
            </Link>
          ))}
          {me && (
            <>
              <span className="hidden md:block text-sm text-slate-500">{me.name} ({me.role})</span>
              <button onClick={logout} className="px-3 py-2 rounded-lg text-sm border border-sky-200 text-sky-700 hover:bg-sky-50">ออกจากระบบ</button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
