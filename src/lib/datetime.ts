export const THAI_TIME_ZONE = "Asia/Bangkok";

export function formatThaiDateTime(value: string | Date) {
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: THAI_TIME_ZONE,
  }).format(new Date(value));
}

export function toThaiDatetimeLocal(value: string | Date) {
  const d = new Date(value);
  const formatter = new Intl.DateTimeFormat("sv-SE", {
    timeZone: THAI_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(d);
  const get = (type: string) => parts.find((p) => p.type === type)?.value || "00";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}
