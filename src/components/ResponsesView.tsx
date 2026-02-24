"use client";

import { useEffect, useMemo, useState } from "react";

type Submission = {
  id: string;
  createdAt: string;
  answers: { id: string; value: string; question: { id: string; text: string; order: number } }[];
};

export default function ResponsesView({ formId }: { formId: string }) {
  const [subs, setSubs] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await fetch(`/api/forms/${formId}/submissions`, { cache: "no-store" }).then((r) => r.json());
      setSubs(data);
      setLoading(false);
    })();
  }, [formId]);

  const total = subs.length;

  const summary = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of subs) {
      for (const a of s.answers) {
        if (String(a.value ?? "").trim()) {
          map.set(a.question.text, (map.get(a.question.text) ?? 0) + 1);
        }
      }
    }
    return Array.from(map.entries());
  }, [subs]);

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
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">📊 สรุปคำตอบ</h2>
            <span className="bg-purple-100 text-purple-700 px-4 py-1 rounded-full font-medium">{total} คำตอบ</span>
          </div>

          {total === 0 ? (
            <p className="text-gray-500 text-center py-8">ยังไม่มีคำตอบ</p>
          ) : (
            <div className="space-y-4">
              {summary.map(([q, c]) => (
                <div key={q}>
                  <h4 className="font-medium mb-1">{q}</h4>
                  <p className="text-sm text-gray-500">{c} คำตอบ</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          {subs.map((s, idx) => {
            const dateStr = new Date(s.createdAt).toLocaleString("th-TH", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            const ordered = [...s.answers].sort((a, b) => a.question.order - b.question.order);

            return (
              <div key={s.id} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                    คำตอบ #{total - idx}
                  </span>
                  <span className="text-gray-500 text-sm">{dateStr}</span>
                </div>

                {ordered.map((a) => (
                  <div key={a.id} className="mb-3">
                    <p className="text-sm text-gray-500">{a.question.text}</p>
                    <p className="font-medium">
                      {a.value?.trim() ? a.value : <span className="text-gray-400">ไม่ได้ตอบ</span>}
                    </p>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
