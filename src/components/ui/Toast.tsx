"use client";

import { useState } from "react";

export function useToast() {
  const [msg, setMsg] = useState<string | null>(null);

  function show(message: string, duration = 3000) {
    setMsg(message);
    window.setTimeout(() => setMsg(null), duration);
  }

  return { msg, show };
}

export default function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg z-50">
      {message}
    </div>
  );
}
