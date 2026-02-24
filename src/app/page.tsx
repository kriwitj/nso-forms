import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";

export default async function HomePage() {
  const user = await getCurrentUser();
  const appLink = !user ? "/login" : user.role === "ADMIN" ? "/admin" : "/dashboard";

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <section className="bg-white rounded-2xl border border-sky-100 shadow-sm p-8 md:p-12">
        <span className="inline-flex px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-sm">NSO Forms Platform</span>
        <h1 className="text-4xl md:text-5xl font-bold text-sky-900 mt-4">สร้างแบบฟอร์มง่ายเหมือน Google Forms</h1>
        <p className="mt-4 text-slate-600 max-w-3xl">ระบบฟอร์มพร้อม workflow สำหรับองค์กร: login, อนุมัติผู้ใช้โดยแอดมิน, CRUD ฟอร์ม, เปิด/ปิดการใช้งาน, กำหนดช่วงเวลา และ export ข้อมูลไป Excel ได้ทันที</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href={appLink} className="px-5 py-3 bg-sky-600 text-white rounded-xl hover:bg-sky-700">เริ่มใช้งาน</Link>
          {!user && <Link href="/register" className="px-5 py-3 border border-sky-200 text-sky-700 rounded-xl hover:bg-sky-50">สมัครสมาชิก</Link>}
        </div>
      </section>
    </main>
  );
}
