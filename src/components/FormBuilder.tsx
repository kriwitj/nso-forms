"use client";

import { useEffect, useState } from "react";

type Question = { id: string; text: string; type: string; required: boolean; order: number };

export default function FormBuilder({ formId }: { formId: string }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);

  async function load() {
    const data = await fetch(`/api/forms/${formId}`, { cache: "no-store" }).then((r) => r.json());
    setTitle(data.title);
    setDescription(data.description || "");
    setIsActive(data.isActive);
    setStartAt(data.startAt ? data.startAt.slice(0, 16) : "");
    setEndAt(data.endAt ? data.endAt.slice(0, 16) : "");
    setQuestions(data.questions || []);
  }

  useEffect(() => { void load(); }, [formId]);

  async function saveMeta() {
    await fetch(`/api/forms/${formId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, description, isActive, startAt: startAt || null, endAt: endAt || null }) });
    alert("บันทึกแล้ว");
  }

  async function addQuestion() {
    await fetch(`/api/forms/${formId}/questions`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "short", text: "คำถามใหม่" }) });
    await load();
  }

  return <main className="max-w-4xl mx-auto p-6 space-y-4">
    <h1 className="text-2xl font-bold">แก้ไขฟอร์ม</h1>
    <input className="w-full border p-2 rounded" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="ชื่อฟอร์ม" />
    <textarea className="w-full border p-2 rounded" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="คำอธิบาย" />
    <div className="flex gap-4 items-center">
      <label><input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} /> เปิดใช้งาน</label>
      <label>เริ่ม <input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} className="border p-1 rounded" /></label>
      <label>สิ้นสุด <input type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} className="border p-1 rounded" /></label>
      <button onClick={saveMeta} className="bg-purple-600 text-white px-3 py-1 rounded">บันทึก</button>
    </div>
    <div className="bg-white p-4 rounded shadow">
      <div className="flex justify-between"><h2 className="font-semibold">คำถาม ({questions.length})</h2><button onClick={addQuestion} className="border px-2 py-1 rounded">+ เพิ่มคำถาม</button></div>
      {questions.map((q) => <div key={q.id} className="border-b py-2">{q.text}</div>)}
    </div>
  </main>;
}
