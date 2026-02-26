"use client";

import { useEffect, useMemo, useState } from "react";
import Toast, { useToast } from "./ui/Toast";

type QuestionType = "short" | "long" | "multiple" | "checkbox" | "dropdown" | "scale" | "date" | "time";
type Question = { id: string; text: string; type: QuestionType; options: string[]; required: boolean; order: number };
type Form = { id: string; title: string; description: string; isActive: boolean; startAt: string | null; endAt: string | null; questions: Question[] };

export default function FormPreview({ formId }: { formId: string }) {
  const { msg, show } = useToast();
  const [data, setData] = useState<Form | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await fetch(`/api/forms/${formId}`, { cache: "no-store" });
      if (!res.ok) return setLoading(false);
      setData(await res.json());
      setAnswers({});
      setSubmitted(false);
      setLoading(false);
    })();
  }, [formId]);

  const questions = useMemo(() => (data?.questions ?? []).slice().sort((a, b) => a.order - b.order), [data]);

  async function submit() {
    if (!data) return;
    const missing = questions.filter((q) => q.required && !String(answers[q.id] ?? "").trim());
    if (missing.length) return show("กรุณากรอกคำถามที่จำเป็นให้ครบ");
    const res = await fetch(`/api/forms/${formId}/submit`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ answers }) });
    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      if (payload?.error === "form_inactive") {
        return show("แบบฟอร์มนี้ปิดรับคำตอบแล้ว");
      }
      return show("เกิดข้อผิดพลาดในการส่ง");
    }
    setSubmitted(true);
    setAnswers({});
  }

  const isAcceptingResponses = useMemo(() => {
    if (!data) return false;
    const now = new Date();
    if (!data.isActive) return false;
    if (data.startAt && now < new Date(data.startAt)) return false;
    if (data.endAt && now > new Date(data.endAt)) return false;
    return true;
  }, [data]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-600 dark:text-slate-300">กำลังโหลด...</div>;
  if (!data) return <div className="p-6 text-center text-gray-600 dark:text-slate-300">ไม่พบแบบฟอร์ม</div>;

  if (submitted) {
    return (
      <div className="min-h-screen py-6">
        <main className="max-w-3xl mx-auto px-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-green-100 border-t-8 border-t-green-500 p-8 text-center">
            <h2 className="text-2xl font-semibold text-green-700 mb-3">เราได้บันทึกคำตอบของคุณไว้แล้ว</h2>
            <p className="text-slate-600">ขอบคุณที่สละเวลาในการตอบแบบฟอร์มนี้</p>
          </div>
        </main>
      </div>
    );
  }

  if (!isAcceptingResponses) {
    return (
      <div className="min-h-screen py-6">
        <main className="max-w-3xl mx-auto px-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-amber-100 border-t-8 border-t-amber-500 p-8 text-center">
            <h2 className="text-2xl font-semibold text-amber-700 mb-3">แบบฟอร์ม "{data.title}" นี้ไม่รับคำตอบแล้ว</h2>
            <p className="text-slate-600">โปรดลองติดต่อเจ้าของแบบฟอร์ม หากคิดว่าเกิดความผิดพลาด</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6">
      <main className="max-w-3xl mx-auto px-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-sky-100 dark:border-slate-700 border-t-8 border-t-sky-600 mb-4 overflow-hidden p-6">
          <h2 className="text-2xl font-semibold text-sky-900">{data.title}</h2>
          <p className="text-slate-600 mt-2">{data.description}</p>
        </div>

        <div className="space-y-4">
          {questions.map((q, idx) => (
            <div key={q.id} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-sky-100 dark:border-slate-700 p-6">
              <div className="flex items-start gap-3 mb-4">
                <span className="bg-sky-100 text-sky-700 px-2 py-1 rounded text-sm font-medium">{idx + 1}</span>
                <h3 className="text-lg font-medium">{q.text}{q.required && <span className="text-red-500 ml-1">*</span>}</h3>
              </div>
              <div className="ml-9">
                {q.type === "short" && <input className="w-full px-4 py-3 border border-sky-200 dark:border-slate-600 rounded-lg" value={answers[q.id] ?? ""} onChange={(e) => setAnswers((p) => ({ ...p, [q.id]: e.target.value }))} placeholder="คำตอบของคุณ" />}
                {q.type === "long" && <textarea className="w-full px-4 py-3 border border-sky-200 dark:border-slate-600 rounded-lg h-32" value={answers[q.id] ?? ""} onChange={(e) => setAnswers((p) => ({ ...p, [q.id]: e.target.value }))} placeholder="คำตอบของคุณ" />}
                {(q.type === "multiple" || q.type === "scale") && (q.type === "scale" ? ["1", "2", "3", "4", "5"] : q.options).map((opt) => <label key={opt} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"><input type="radio" name={`q_${q.id}`} value={opt} checked={(answers[q.id] ?? "") === opt} onChange={(e) => setAnswers((p) => ({ ...p, [q.id]: e.target.value }))} className="w-4 h-4 accent-sky-600" /><span>{opt}</span></label>)}
                {q.type === "checkbox" && q.options.map((opt) => {
                  const set = new Set((answers[q.id] ?? "").split(",").map((s) => s.trim()).filter(Boolean));
                  return <label key={opt} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"><input type="checkbox" className="w-4 h-4 accent-sky-600" checked={set.has(opt)} onChange={(e) => {
                    const next = new Set(set); if (e.target.checked) next.add(opt); else next.delete(opt); setAnswers((p) => ({ ...p, [q.id]: Array.from(next).join(", ") }));
                  }} /><span>{opt}</span></label>;
                })}
                {q.type === "dropdown" && <select className="w-full px-4 py-3 border border-sky-200 dark:border-slate-600 rounded-lg" value={answers[q.id] ?? ""} onChange={(e) => setAnswers((p) => ({ ...p, [q.id]: e.target.value }))}><option value="">เลือก...</option>{q.options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}</select>}
                {q.type === "date" && <input type="date" className="w-full px-4 py-3 border border-sky-200 dark:border-slate-600 rounded-lg" value={answers[q.id] ?? ""} onChange={(e) => setAnswers((p) => ({ ...p, [q.id]: e.target.value }))} />}
                {q.type === "time" && <input type="time" className="w-full px-4 py-3 border border-sky-200 dark:border-slate-600 rounded-lg" value={answers[q.id] ?? ""} onChange={(e) => setAnswers((p) => ({ ...p, [q.id]: e.target.value }))} />}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-6"><button onClick={submit} className="bg-sky-600 hover:bg-sky-700 text-white px-8 py-3 rounded-lg font-medium">ส่งคำตอบ</button></div>
      </main>
      <Toast message={msg} />
    </div>
  );
}
