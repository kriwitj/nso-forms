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

type Question = { id: string; text: string; type: QuestionType; options: string[]; required: boolean; order: number };
type Form = { id: string; title: string; description: string; questions: Question[] };

export default function FormPreview({ formId }: { formId: string }) {
  const { msg, show } = useToast();
  const [data, setData] = useState<Form | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await fetch(`/api/forms/${formId}`, { cache: "no-store" });
      if (!res.ok) {
        setData(null);
        setLoading(false);
        return;
      }
      const f = await res.json();
      setData(f);
      setAnswers({});
      setLoading(false);
    })();
  }, [formId]);

  const questions = useMemo(
    () => (data?.questions ?? []).slice().sort((a, b) => a.order - b.order),
    [data]
  );

  async function submit() {
    if (!data) return;
    const missing = questions.filter((q) => q.required && !String(answers[q.id] ?? "").trim());
    if (missing.length) {
      show("กรุณากรอกคำถามที่จำเป็นให้ครบ");
      return;
    }
    const res = await fetch(`/api/forms/${formId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers }),
    });
    if (!res.ok) {
      show("เกิดข้อผิดพลาดในการส่ง");
      return;
    }
    show("✅ ส่งคำตอบเรียบร้อยแล้ว!");
    setAnswers({});
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
        <span className="ml-3">กำลังโหลด...</span>
      </div>
    );
  }

  if (!data) return <div className="p-6 text-center text-gray-600">ไม่พบแบบฟอร์ม</div>;

  return (
    <div className="min-h-screen">
      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-sm border-t-8 border-purple-600 mb-4 overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-semibold text-gray-800">{data.title}</h2>
            <p className="text-gray-600 mt-2">{data.description}</p>
          </div>
        </div>

        <div className="space-y-4">
          {questions.map((q, idx) => (
            <div key={q.id} className="bg-white rounded-xl shadow-sm mb-4 p-6">
              <div className="flex items-start gap-3 mb-4">
                <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-sm font-medium">{idx + 1}</span>
                <h3 className="text-lg font-medium">
                  {q.text}
                  {q.required && <span className="text-red-500 ml-1">*</span>}
                </h3>
              </div>

              <div className="ml-9">
                {q.type === "short" && (
                  <input
                    className="w-full px-4 py-3 border-2 rounded-lg focus:border-purple-500 outline-none"
                    value={answers[q.id] ?? ""}
                    onChange={(e) => setAnswers((p) => ({ ...p, [q.id]: e.target.value }))}
                    placeholder="คำตอบของคุณ"
                  />
                )}

                {q.type === "long" && (
                  <textarea
                    className="w-full px-4 py-3 border-2 rounded-lg focus:border-purple-500 outline-none h-32"
                    value={answers[q.id] ?? ""}
                    onChange={(e) => setAnswers((p) => ({ ...p, [q.id]: e.target.value }))}
                    placeholder="คำตอบของคุณ"
                  />
                )}

                {(q.type === "multiple" || q.type === "scale") &&
                  (q.type === "scale" ? ["1", "2", "3", "4", "5"] : q.options).map((opt) => (
                    <label key={opt} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name={`q_${q.id}`}
                        value={opt}
                        checked={(answers[q.id] ?? "") === opt}
                        onChange={(e) => setAnswers((p) => ({ ...p, [q.id]: e.target.value }))}
                        className="w-5 h-5 accent-purple-600"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}

                {q.type === "checkbox" &&
                  q.options.map((opt) => {
                    const set = new Set((answers[q.id] ?? "").split(",").map((s) => s.trim()).filter(Boolean));
                    const checked = set.has(opt);
                    return (
                      <label key={opt} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-5 h-5 accent-purple-600"
                          checked={checked}
                          onChange={(e) => {
                            const next = new Set(set);
                            if (e.target.checked) next.add(opt);
                            else next.delete(opt);
                            setAnswers((p) => ({ ...p, [q.id]: Array.from(next).join(", ") }));
                          }}
                        />
                        <span>{opt}</span>
                      </label>
                    );
                  })}

                {q.type === "dropdown" && (
                  <select
                    className="w-full px-4 py-3 border-2 rounded-lg focus:border-purple-500 outline-none"
                    value={answers[q.id] ?? ""}
                    onChange={(e) => setAnswers((p) => ({ ...p, [q.id]: e.target.value }))}
                  >
                    <option value="">เลือก...</option>
                    {q.options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                )}

                {q.type === "date" && (
                  <input
                    type="date"
                    className="w-full px-4 py-3 border-2 rounded-lg focus:border-purple-500 outline-none"
                    value={answers[q.id] ?? ""}
                    onChange={(e) => setAnswers((p) => ({ ...p, [q.id]: e.target.value }))}
                  />
                )}

                {q.type === "time" && (
                  <input
                    type="time"
                    className="w-full px-4 py-3 border-2 rounded-lg focus:border-purple-500 outline-none"
                    value={answers[q.id] ?? ""}
                    onChange={(e) => setAnswers((p) => ({ ...p, [q.id]: e.target.value }))}
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-6">
          <button onClick={submit} className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-medium">
            ส่งคำตอบ
          </button>
        </div>
      </main>

      <Toast message={msg} />
    </div>
  );
}
