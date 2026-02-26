import Link from "next/link";

type Crumb = { label: string; href?: string };

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="text-sm text-sky-700 dark:text-sky-300 mb-4" aria-label="Breadcrumb">
      <ol className="flex items-center gap-2 flex-wrap">
        {items.map((item, idx) => (
          <li key={`${item.label}-${idx}`} className="flex items-center gap-2">
            {idx > 0 && <span className="text-sky-300 dark:text-slate-600">/</span>}
            {item.href ? (
              <Link href={item.href} className="hover:text-sky-900 dark:hover:text-sky-200 hover:underline">
                {item.label}
              </Link>
            ) : (
              <span className="text-sky-900 dark:text-sky-100 font-medium">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
