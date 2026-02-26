"use client";

import Breadcrumbs from "@/components/Breadcrumbs";
import Toast, { useToast } from "@/components/ui/Toast";
import { formatThaiDateTime, toThaiDatetimeLocal } from "@/lib/datetime";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type QuestionType = "short" | "long" | "multiple" | "checkbox" | "dropdown" | "scale" | "date" | "time";
type Question = { id: string; text: string; type: QuestionType; required: boolean; order: number; options: string[] };
type Submission = {
  id: string;
  createdAt: string;
  answers: { id: string; value: string; question: { id: string; text: string; order: number } }[];
};

type Tab = "edit" | "preview" | "responses";

function toBangkokIso(datetimeLocal: string) {
  if (!datetimeLocal) return null;
  return `${datetimeLocal}:00+07:00`;
}

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: "short", label: "📝 คำตอบสั้น" },
  { value: "long", label: "📄 คำตอบยาว" },
  { value: "multiple", label: "⭕ หลายตัวเลือก" },
  { value: "checkbox", label: "☑️ ช่องทำเครื่องหมาย" },
  { value: "dropdown", label: "📋 ดรอปดาวน์" },
  { value: "scale", label: "⭐ มาตราส่วน" },
  { value: "date", label: "📅 วันที่" },
  { value: "time", label: "⏰ เวลา" },
];

export default function FormBuilder({ formId }: { formId: string }) {
  const [activeTab, setActiveTab] = useState<Tab>("edit");
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [title, setTitle] = useState("แบบฟอร์มใหม่");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const { msg, show } = useToast();

  async function load() {
    const data = await fetch(`/api/forms/${formId}`, { cache: "no-store" }).then((r) => r.json());
    setTitle(data.title);
    setDescription(data.description || "");
    setIsActive(data.isActive);
    setStartAt(data.startAt ? toThaiDatetimeLocal(data.startAt) : "");
    setEndAt(data.endAt ? toThaiDatetimeLocal(data.endAt) : "");
    setQuestions((data.questions || []).sort((a: Question, b: Question) => a.order - b.order));
  }

  async function loadSubmissions() {
    const data = await fetch(`/api/forms/${formId}/submissions`, { cache: "no-store" }).then((r) => r.json());
    setSubmissions(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    void load();
    void loadSubmissions();
  }, [formId]);

  async function saveMeta() {
    if (!window.confirm("ยืนยันบันทึกการเปลี่ยนแปลงฟอร์ม?")) return;
    const response = await fetch(`/api/forms/${formId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, isActive, startAt: toBangkokIso(startAt), endAt: toBangkokIso(endAt), formData: { title, description, questions } }),
    });
    if (!response.ok) {
      show("บันทึกไม่สำเร็จ");
      return;
    }
    show("บันทึกฟอร์มเรียบร้อย");
  }

  async function publishForm() {
    const publicUrl = `${window.location.origin}/f/${formId}`;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(publicUrl);
        show("เผยแพร่แล้ว: คัดลอกลิงก์สำหรับตอบแบบฟอร์มเรียบร้อย");
      } else {
        show(`ลิงก์สำหรับตอบแบบฟอร์ม: ${publicUrl}`);
      }
    } catch {
      show(`ลิงก์สำหรับตอบแบบฟอร์ม: ${publicUrl}`);
    }
  }

  async function addQuestion(type: QuestionType) {
    const options = ["multiple", "checkbox", "dropdown"].includes(type)
      ? ["ตัวเลือก 1", "ตัวเลือก 2", "ตัวเลือก 3"]
      : [];
    const response = await fetch(`/api/forms/${formId}/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, text: "คำถามใหม่", options }),
    });
    if (!response.ok) return show("เพิ่มคำถามไม่สำเร็จ");
    setShowTypeModal(false);
    show("เพิ่มคำถามแล้ว");
    await load();
  }

  async function updateQuestion(questionId: string, patch: Partial<Question>) {
    const response = await fetch(`/api/forms/${formId}/questions/${questionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!response.ok) return show("บันทึกคำถามไม่สำเร็จ");
    await load();
  }

  async function removeQuestion(questionId: string) {
    if (!window.confirm("ยืนยันลบคำถามนี้?")) return;
    const response = await fetch(`/api/forms/${formId}/questions/${questionId}`, { method: "DELETE" });
    if (!response.ok) return show("ลบคำถามไม่สำเร็จ");
    show("ลบคำถามแล้ว");
    await load();
  }

  async function duplicateQuestion(q: Question) {
    const response = await fetch(`/api/forms/${formId}/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: q.type, text: `${q.text} (สำเนา)`, options: q.options, required: q.required }),
    });
    if (!response.ok) return show("คัดลอกคำถามไม่สำเร็จ");
    show("คัดลอกคำถามแล้ว");
    await load();
  }

  async function submitPreview() {
    const response = await fetch(`/api/forms/${formId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers }),
    });
    if (!response.ok) {
      show("ส่งคำตอบไม่สำเร็จ");
      return;
    }
    setAnswers({});
    show("ส่งคำตอบเรียบร้อยแล้ว");
    await loadSubmissions();
    setActiveTab("responses");
  }

  const responseSummary = useMemo(() => {
    const map = new Map<string, number>();
    submissions.forEach((s) =>
      s.answers.forEach((a) => {
        if (a.value?.trim()) map.set(a.question.text, (map.get(a.question.text) ?? 0) + 1);
      })
    );
    return Array.from(map.entries());
  }, [submissions]);

  const tabs: { id: Tab; label: string }[] = [
    { id: "edit", label: "แก้ไขคำถาม" },
    { id: "preview", label: "ดูตัวอย่าง" },
    { id: "responses", label: "ดูคำตอบ" },
  ];

  return (
    <main className="max-w-4xl mx-auto px-4 py-6">
      <Breadcrumbs items={[{ label: "หน้าแรก", href: "/" }, { label: "แดชบอร์ด", href: "/dashboard" }, { label: "Form Builder" }]} />

      <header className="bg-white dark:bg-slate-900 shadow-sm sticky top-16 z-30 rounded-xl mb-4">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h1 className="text-xl font-semibold text-gray-800 dark:text-slate-100">{title}</h1>
            <div className="flex gap-2">
              <button onClick={() => setActiveTab("preview")} className="px-3 py-2 text-purple-600 dark:text-purple-200 hover:bg-purple-50 dark:hover:bg-slate-800 rounded-lg">👁️ ดูตัวอย่าง</button>
              <button onClick={() => setActiveTab("responses")} className="px-3 py-2 text-purple-600 dark:text-purple-200 hover:bg-purple-50 dark:hover:bg-slate-800 rounded-lg">
                📊 คำตอบ <span className="bg-purple-100 dark:bg-purple-900/40 px-2 py-0.5 rounded-full text-sm">{submissions.length}</span>
              </button>
              <Link href={`/f/${formId}`} className="px-3 py-2 rounded-lg bg-purple-600 text-white">หน้าแบบฟอร์มจริง</Link>
            </div>
          </div>

          <div className="flex gap-6 mt-4 border-b border-slate-200 dark:border-slate-700">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`pb-2 font-medium ${activeTab === t.id ? "border-b-[3px] border-purple-500 dark:border-purple-400 text-purple-700 dark:text-purple-200" : "text-gray-500 dark:text-slate-400"}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {activeTab === "edit" && (
        <section>
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border-t-8 border-purple-500 dark:border-purple-400 mb-4 overflow-hidden p-6 space-y-3">
            <input className="w-full text-2xl font-semibold border-b-2 border-transparent hover:border-gray-200 focus:border-purple-500 outline-none pb-2" value={title} onChange={(e) => setTitle(e.target.value)} />
            <input className="w-full text-gray-600 dark:text-slate-300 border-b-2 border-transparent hover:border-gray-200 focus:border-purple-500 outline-none pb-2" placeholder="คำอธิบายแบบฟอร์ม" value={description} onChange={(e) => setDescription(e.target.value)} />
            <div className="flex flex-wrap gap-4 items-center pt-2">
              <label><input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} /> เปิดใช้งาน</label>
              <label>เริ่ม <input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} className="border border-slate-300 dark:border-slate-600 dark:bg-slate-800 p-1 rounded" /></label>
              <label>สิ้นสุด <input type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} className="border border-slate-300 dark:border-slate-600 dark:bg-slate-800 p-1 rounded" /></label>
              <button onClick={publishForm} className="px-3 py-1 bg-sky-600 text-white rounded">เผยแพร่</button>
              <button onClick={saveMeta} className="px-3 py-1 bg-purple-600 text-white rounded">บันทึก</button>
            </div>
          </div>

          <div className="space-y-4">
            {questions.map((q, idx) => (
              <div key={q.id} className="bg-white dark:bg-slate-900 rounded-xl shadow-sm overflow-hidden border-l-4 border-purple-500 dark:border-purple-400 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <span className="bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-200 px-2 py-1 rounded text-sm font-medium">{idx + 1}</span>
                  <input className="flex-1 text-lg border-b-2 border-transparent hover:border-gray-200 focus:border-purple-500 outline-none" defaultValue={q.text} onBlur={(e) => updateQuestion(q.id, { text: e.target.value })} />
                </div>
                <div className="mb-3">
                  <select className="px-3 py-2 bg-gray-50 dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-600 text-sm" value={q.type} onChange={(e) => updateQuestion(q.id, { type: e.target.value as QuestionType, options: [] })}>
                    {QUESTION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>

                {(["multiple", "checkbox", "dropdown"] as QuestionType[]).includes(q.type) && (
                  <div className="space-y-2 mb-4">
                    {q.options.map((opt, i) => (
                      <div key={`${q.id}-${i}`} className="flex items-center gap-2">
                        <input className="flex-1 px-3 py-2 border border-sky-200 dark:border-slate-600 rounded-lg" defaultValue={opt} onBlur={(e) => {
                          const next = [...q.options];
                          next[i] = e.target.value;
                          void updateQuestion(q.id, { options: next });
                        }} />
                        <button className="text-red-600" onClick={() => {
                          const next = q.options.filter((_, oi) => oi !== i);
                          void updateQuestion(q.id, { options: next });
                        }}>ลบ</button>
                      </div>
                    ))}
                    <button className="text-purple-600 text-sm" onClick={() => updateQuestion(q.id, { options: [...q.options, `ตัวเลือก ${q.options.length + 1}`] })}>+ เพิ่มตัวเลือก</button>
                  </div>
                )}

                <div className="flex justify-between border-t pt-3">
                  <label><input type="checkbox" checked={q.required} onChange={(e) => updateQuestion(q.id, { required: e.target.checked })} /> จำเป็น</label>
                  <div className="space-x-2">
                    <button className="px-2 py-1 rounded bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-200" onClick={() => duplicateQuestion(q)}>คัดลอก</button>
                    <button className="px-2 py-1 rounded bg-red-50 text-red-700" onClick={() => removeQuestion(q.id)}>ลบ</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-6">
            <button onClick={() => setShowTypeModal(true)} className="px-6 py-3 bg-white dark:bg-slate-900 rounded-full shadow-md font-medium text-purple-600 border border-purple-200">+ เพิ่มคำถาม</button>
          </div>
        </section>
      )}

      {activeTab === "preview" && (
        <section>
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border-t-8 border-purple-500 dark:border-purple-400 mb-4 overflow-hidden p-6">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-slate-100">{title}</h2>
            <p className="text-gray-600 dark:text-slate-300 mt-2">{description}</p>
          </div>

          <div className="space-y-4">
            {questions.map((q, idx) => (
              <div key={q.id} className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-6">
                <div className="flex items-start gap-3 mb-4">
                  <span className="bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-200 px-2 py-1 rounded text-sm font-medium">{idx + 1}</span>
                  <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">{q.text}{q.required && <span className="text-red-500 ml-1">*</span>}</h3>
                </div>
                <div className="ml-9">
                  {q.type === "short" && <input className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600 dark:bg-slate-800 rounded-lg" onChange={(e) => setAnswers((p) => ({ ...p, [q.id]: e.target.value }))} />}
                  {q.type === "long" && <textarea className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600 dark:bg-slate-800 rounded-lg h-28" onChange={(e) => setAnswers((p) => ({ ...p, [q.id]: e.target.value }))} />}
                  {q.type === "multiple" && q.options.map((opt) => <label key={opt} className="block p-2 text-slate-800 dark:text-slate-200"><input type="radio" name={`q_${q.id}`} value={opt} onChange={(e) => setAnswers((p) => ({ ...p, [q.id]: e.target.value }))} /> {opt}</label>)}
                  {q.type === "checkbox" && q.options.map((opt) => <label key={opt} className="block p-2 text-slate-800 dark:text-slate-200"><input type="checkbox" onChange={(e) => {
                    const set = new Set((answers[q.id] ?? "").split(",").map((s) => s.trim()).filter(Boolean));
                    if (e.target.checked) set.add(opt); else set.delete(opt);
                    setAnswers((p) => ({ ...p, [q.id]: Array.from(set).join(", ") }));
                  }} /> {opt}</label>)}
                  {q.type === "dropdown" && <select className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600 dark:bg-slate-800 rounded-lg" onChange={(e) => setAnswers((p) => ({ ...p, [q.id]: e.target.value }))}><option value="">เลือก...</option>{q.options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}</select>}
                  {q.type === "scale" && <div className="flex items-center gap-3 text-slate-800 dark:text-slate-200">{[1, 2, 3, 4, 5].map((n) => <label key={n}><input type="radio" name={`q_${q.id}`} value={n} onChange={(e) => setAnswers((p) => ({ ...p, [q.id]: e.target.value }))} /> {n}</label>)}</div>}
                  {q.type === "date" && <input type="date" className="px-4 py-3 border-2 border-slate-300 dark:border-slate-600 dark:bg-slate-800 rounded-lg" onChange={(e) => setAnswers((p) => ({ ...p, [q.id]: e.target.value }))} />}
                  {q.type === "time" && <input type="time" className="px-4 py-3 border-2 border-slate-300 dark:border-slate-600 dark:bg-slate-800 rounded-lg" onChange={(e) => setAnswers((p) => ({ ...p, [q.id]: e.target.value }))} />}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-6"><button onClick={submitPreview} className="bg-purple-600 text-white px-8 py-3 rounded-lg">ส่งคำตอบ</button></div>
        </section>
      )}

      {activeTab === "responses" && (
        <section>
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-6 mb-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-slate-100">📊 สรุปคำตอบ</h2>
              <span className="bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-200 px-4 py-1 rounded-full font-medium">{submissions.length} คำตอบ</span>
            </div>
            {submissions.length === 0 ? <p className="text-gray-500 dark:text-slate-400">ยังไม่มีคำตอบ</p> : responseSummary.map(([q, c]) => <div key={q} className="mb-3"><h4 className="font-medium">{q}</h4><p className="text-sm text-gray-500 dark:text-slate-400">{c} คำตอบ</p></div>)}
          </div>

          {submissions.map((s, i) => {
            const ordered = [...s.answers].sort((a, b) => a.question.order - b.question.order);
            return <div key={s.id} className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-6 mb-4"><div className="flex justify-between mb-4"><span className="bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-200 px-3 py-1 rounded-full text-sm">คำตอบ #{submissions.length - i}</span><span className="text-sm text-gray-500 dark:text-slate-400">{formatThaiDateTime(s.createdAt)}</span></div>{ordered.map((a) => <div key={a.id} className="mb-2"><p className="text-sm text-gray-500 dark:text-slate-400">{a.question.text}</p><p className="font-medium">{a.value || <span className="text-gray-400">ไม่ได้ตอบ</span>}</p></div>)}</div>;
          })}
        </section>
      )}

      {showTypeModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowTypeModal(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-200 dark:border-slate-700"><h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">เลือกประเภทคำถาม</h3></div>
            <div className="p-4 grid grid-cols-2 gap-3">
              {QUESTION_TYPES.map((t) => (
                <button key={t.value} onClick={() => addQuestion(t.value)} className="p-4 rounded-xl hover:bg-purple-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-600 text-left">{t.label}</button>
              ))}
            </div>
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800"><button onClick={() => setShowTypeModal(false)} className="w-full py-2 text-slate-700 dark:text-slate-200">ยกเลิก</button></div>
          </div>
        </div>
      )}
      <Toast message={msg} />
    </main>
  );
}
