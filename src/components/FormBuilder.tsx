"use client";

import { useEffect, useMemo, useState } from "react";
import Toast, { useToast } from "./ui/Toast";

type QuestionType =
  | "short"
  | "long"
  | "multiple"
  | "checkbox"
  | "dropdown"
  | "scale"
  | "date"
  | "time";

type Form = { id: string; title: string; description: string };
type Question = {
  id: string;
  formId: string;
  text: string;
  type: QuestionType;
  options: string[];
  required: boolean;
  order: number;
};

export default function FormBuilder() {
  const { msg, show } = useToast();
  const [tab, setTab] = useState<"edit" | "preview" | "responses">("edit");
  const [form, setForm] = useState<Form | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  const formId = form?.id;

  async function load() {
    setLoading(true);
    const f = await fetch("/api/forms", { cache: "no-store" }).then((r) => r.json());
    setForm(f);
    const full = await fetch(`/api/forms/${f.id}`, { cache: "no-store" }).then((r) => r.json());
    setQuestions((full.questions ?? []).sort((a: Question, b: Question) => a.order - b.order));
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  async function patchForm(p: Partial<Form>) {
    const updated = await fetch("/api/forms", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(p),
    }).then((r) => r.json());
    setForm(updated);
  }

  async function addQuestion(type: QuestionType) {
    if (!formId) return;
    const defaultOptions =
      type === "multiple" || type === "checkbox" || type === "dropdown"
        ? ["ตัวเลือก 1", "ตัวเลือก 2", "ตัวเลือก 3"]
        : [];
    const q = await fetch(`/api/forms/${formId}/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, text: "คำถามใหม่", options: defaultOptions, required: false }),
    }).then((r) => r.json());
    setQuestions((prev) => [...prev, q].sort((a, b) => a.order - b.order));
    show("เพิ่มคำถามแล้ว");
  }

  async function updateQuestion(id: string, updates: Partial<Question>) {
    if (!formId) return;
    const updated = await fetch(`/api/forms/${formId}/questions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    }).then((r) => r.json());
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? updated : q)).sort((a, b) => a.order - b.order)
    );
  }

  async function deleteQuestion(id: string) {
    if (!formId) return;
    await fetch(`/api/forms/${formId}/questions/${id}`, { method: "DELETE" });
    setQuestions((prev) => prev.filter((q) => q.id !== id).map((q, i) => ({ ...q, order: i })));
    show("ลบคำถามแล้ว");
  }

  async function duplicateQuestion(q: Question) {
    if (!formId) return;
    const created = await fetch(`/api/forms/${formId}/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: q.type,
        text: q.text + " (สำเนา)",
        options: q.options,
        required: q.required,
      }),
    }).then((r) => r.json());
    setQuestions((prev) => [...prev, created].sort((a, b) => a.order - b.order));
    show("คัดลอกคำถามแล้ว");
  }

  const previewUrl = useMemo(() => (formId ? `/f/${formId}` : "#"), [formId]);
  const responsesUrl = useMemo(() => (formId ? `/f/${formId}/responses` : "#"), [formId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
        <span className="ml-3">กำลังโหลด...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-gray-800">{form?.title ?? "แบบฟอร์มใหม่"}</h1>
            </div>

            <div className="flex gap-2">
              <a href={previewUrl} className="px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg font-medium transition">
                👁️ ดูตัวอย่าง
              </a>
              <a href={responsesUrl} className="px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg font-medium transition">
                📊 คำตอบ
              </a>
            </div>
          </div>

          <div className="flex gap-6 mt-4 border-b">
            <button
              className={`pb-2 font-medium ${tab === "edit" ? "border-b-4 border-purple-600 text-purple-700" : "text-gray-500 hover:text-gray-700"}`}
              onClick={() => setTab("edit")}
            >
              แก้ไขคำถาม
            </button>
            <button
              className={`pb-2 font-medium ${tab === "preview" ? "border-b-4 border-purple-600 text-purple-700" : "text-gray-500 hover:text-gray-700"}`}
              onClick={() => setTab("preview")}
            >
              ดูตัวอย่าง
            </button>
            <button
              className={`pb-2 font-medium ${tab === "responses" ? "border-b-4 border-purple-600 text-purple-700" : "text-gray-500 hover:text-gray-700"}`}
              onClick={() => setTab("responses")}
            >
              ดูคำตอบ
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {tab === "edit" && (
          <>
            <div className="bg-white rounded-xl shadow-sm border-t-8 border-purple-600 mb-4 overflow-hidden">
              <div className="p-6">
                <input
                  className="w-full text-2xl font-semibold border-b-2 border-transparent hover:border-gray-200 focus:border-purple-500 outline-none pb-2 transition"
                  defaultValue={form?.title ?? "แบบฟอร์มใหม่"}
                  placeholder="ชื่อแบบฟอร์ม"
                  onBlur={(e) => patchForm({ title: e.target.value })}
                />
                <input
                  className="w-full text-gray-600 border-b-2 border-transparent hover:border-gray-200 focus:border-purple-500 outline-none mt-3 pb-2 transition"
                  defaultValue={form?.description ?? ""}
                  placeholder="คำอธิบายแบบฟอร์ม"
                  onBlur={(e) => patchForm({ description: e.target.value })}
                />
              </div>
            </div>

            {questions.length === 0 ? (
              <div className="text-center py-12 text-gray-500 bg-white rounded-xl shadow-sm">
                <div className="text-6xl mb-4">📝</div>
                <p className="text-lg">ยังไม่มีคำถาม</p>
                <p className="text-sm">เพิ่มคำถามเพื่อเริ่มสร้างแบบฟอร์ม</p>
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((q, idx) => {
                  const hasOptions = q.type === "multiple" || q.type === "checkbox" || q.type === "dropdown";
                  return (
                    <div key={q.id} className="bg-white rounded-xl shadow-sm overflow-hidden border-l-4 border-purple-600">
                      <div className="p-5">
                        <div className="flex items-start gap-4">
                          <div className="text-gray-400 pt-2 select-none">⋮⋮</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-sm font-medium">
                                {idx + 1}
                              </span>
                              <input
                                className="flex-1 text-lg border-b-2 border-transparent hover:border-gray-200 focus:border-purple-500 outline-none pb-1 transition"
                                defaultValue={q.text}
                                placeholder="พิมพ์คำถาม"
                                onBlur={(e) => updateQuestion(q.id, { text: e.target.value })}
                              />
                            </div>

                            <div className="flex items-center gap-2 mb-4">
                              <select
                                className="px-3 py-2 bg-gray-50 rounded-lg border text-sm"
                                value={q.type}
                                onChange={(e) => updateQuestion(q.id, { type: e.target.value as QuestionType, options: [] })}
                              >
                                <option value="short">📝 คำตอบสั้น</option>
                                <option value="long">📄 คำตอบยาว</option>
                                <option value="multiple">⭕ หลายตัวเลือก</option>
                                <option value="checkbox">☑️ ช่องทำเครื่องหมาย</option>
                                <option value="dropdown">📋 ดรอปดาวน์</option>
                                <option value="scale">⭐ มาตราส่วน</option>
                                <option value="date">📅 วันที่</option>
                                <option value="time">⏰ เวลา</option>
                              </select>
                            </div>

                            {hasOptions && (
                              <div className="space-y-2 mb-4">
                                {(q.options ?? []).map((opt, i) => (
                                  <div className="flex items-center gap-2" key={i}>
                                    <span className="text-gray-400">
                                      {q.type === "multiple" ? "⭕" : q.type === "checkbox" ? "☐" : "•"}
                                    </span>
                                    <input
                                      className="flex-1 px-3 py-2 border rounded-lg focus:border-purple-500 outline-none"
                                      defaultValue={opt}
                                      placeholder={`ตัวเลือก ${i + 1}`}
                                      onBlur={(e) => {
                                        const next = [...q.options];
                                        next[i] = e.target.value;
                                        updateQuestion(q.id, { options: next });
                                      }}
                                    />
                                    <button
                                      className="text-gray-400 hover:text-red-500 p-1"
                                      onClick={() => {
                                        const next = q.options.filter((_, idx2) => idx2 !== i);
                                        updateQuestion(q.id, { options: next });
                                      }}
                                      title="ลบตัวเลือก"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ))}
                                <button
                                  className="text-purple-600 hover:text-purple-800 text-sm font-medium mt-2"
                                  onClick={() => updateQuestion(q.id, { options: [...q.options, `ตัวเลือก ${q.options.length + 1}`] })}
                                >
                                  ＋ เพิ่มตัวเลือก
                                </button>
                              </div>
                            )}

                            <div className="flex items-center justify-between pt-4 border-t mt-4">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="w-5 h-5 accent-purple-600"
                                  checked={q.required}
                                  onChange={(e) => updateQuestion(q.id, { required: e.target.checked })}
                                />
                                <span className="text-sm text-gray-600">จำเป็น</span>
                              </label>

                              <div className="flex items-center gap-2">
                                <button
                                  className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                                  onClick={() => duplicateQuestion(q)}
                                  title="คัดลอก"
                                >
                                  ⧉
                                </button>
                                <button
                                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                  onClick={() => deleteQuestion(q.id)}
                                  title="ลบ"
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex justify-center mt-6 gap-2 flex-wrap">
              <button
                className="px-6 py-3 bg-white rounded-full shadow-md hover:shadow-lg transition font-medium text-purple-600 border border-purple-200"
                onClick={() => addQuestion("short")}
              >
                ＋ เพิ่มคำถาม (สั้น)
              </button>
              <button
                className="px-6 py-3 bg-white rounded-full shadow-md hover:shadow-lg transition font-medium text-purple-600 border border-purple-200"
                onClick={() => addQuestion("multiple")}
              >
                ＋ เพิ่มคำถาม (ตัวเลือก)
              </button>
              <button
                className="px-6 py-3 bg-white rounded-full shadow-md hover:shadow-lg transition font-medium text-purple-600 border border-purple-200"
                onClick={() => addQuestion("long")}
              >
                ＋ เพิ่มคำถาม (ยาว)
              </button>
            </div>
          </>
        )}

        {tab === "preview" && formId && (
          <div className="bg-white rounded-xl shadow-sm border-t-8 border-purple-600 mb-4 overflow-hidden p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-800">{form?.title}</h2>
                <p className="text-gray-600 mt-2">{form?.description}</p>
              </div>
              <a className="text-purple-600 font-medium hover:underline" href={previewUrl}>
                เปิดหน้า Preview
              </a>
            </div>
            <p className="text-sm text-gray-500 mt-3">
              หน้า Preview คือฟอร์มสำหรับผู้ตอบ (public) — ส่งคำตอบแล้วจะไปแสดงในหน้า Responses
            </p>
          </div>
        )}

        {tab === "responses" && formId && (
          <div className="bg-white rounded-xl shadow-sm border-t-8 border-purple-600 mb-4 overflow-hidden p-6">
            <a className="text-purple-600 font-medium hover:underline" href={responsesUrl}>
              เปิดหน้า Responses
            </a>
          </div>
        )}
      </main>

      <Toast message={msg} />
    </div>
  );
}
