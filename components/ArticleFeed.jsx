"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

function fmt(date) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric", timeZone: "UTC",
  });
}

export default function ArticleFeed({ articles }) {
  const [active, setActive] = useState("All");
  const tags = useMemo(
    () => ["All", ...Array.from(new Set(articles.flatMap((a) => a.tags || []))).sort()],
    [articles]
  );
  const list =
    active === "All" ? articles : articles.filter((a) => (a.tags || []).includes(active));

  return (
    <div id="articles">
      {tags.length > 1 && (
        <div className="mb-10 flex flex-wrap gap-2" role="group" aria-label="Filter by tag">
          {tags.map((t) => (
            <button
              key={t}
              onClick={() => setActive(t)}
              aria-pressed={active === t}
              className={
                "rounded-full border px-3 py-1 text-sm transition-colors " +
                (active === t
                  ? "border-accent bg-accent text-white dark:border-accent-soft dark:bg-accent-soft dark:text-night"
                  : "border-neutral-300 text-neutral-600 hover:border-neutral-400 dark:border-neutral-700 dark:text-neutral-400")
              }
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {list.length === 0 ? (
        <p className="text-neutral-500">No articles with this tag yet.</p>
      ) : (
        <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
          {list.map((a) => (
            <li key={a.slug} className="py-8 first:pt-0">
              <Link href={`/articles/${a.slug}`} className="group block">
                <h2 className="font-serif text-2xl font-semibold leading-snug tracking-tight group-hover:text-accent dark:group-hover:text-accent-soft">
                  {a.title}
                </h2>
                {a.description && (
                  <p className="mt-2 text-neutral-600 dark:text-neutral-400">{a.description}</p>
                )}
                <p className="mt-3 text-sm text-neutral-500">
                  {fmt(a.date)} · {a.readTime} min read
                  {a.tags?.length > 0 && <> · {a.tags.join(", ")}</>}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
