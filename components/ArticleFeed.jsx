"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { onValue, ref } from "firebase/database";
import { rtdb } from "@/lib/firebase";

function fmt(date) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric", timeZone: "UTC",
  });
}

export default function ArticleFeed() {
  const [active, setActive] = useState("All");
  const [publishedArticles, setPublishedArticles] = useState([]);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    return onValue(
      ref(rtdb, "articles/published"),
      (snapshot) => {
        const data = snapshot.val() || {};
        setPublishedArticles(
          Object.entries(data).map(([slug, article]) => ({ ...article, slug }))
        );
        setLoadError(false);
      },
      (error) => {
        console.error("Published articles listener error:", error);
        setLoadError(true);
      }
    );
  }, []);

  const allArticles = useMemo(
    () => [...publishedArticles].sort((a, b) => (a.date < b.date ? 1 : -1)),
    [publishedArticles]
  );
  const tags = useMemo(
    () => ["All", ...Array.from(new Set(allArticles.flatMap((a) => a.tags || []))).sort()],
    [allArticles]
  );
  const list =
    active === "All" ? allArticles : allArticles.filter((a) => (a.tags || []).includes(active));

  return (
    <div>
      {loadError && (
        <p role="alert" className="mb-6 text-sm text-red-600 dark:text-red-400">
          Articles couldn’t be loaded from the database. Check that Realtime Database rules allow public reads of published articles.
        </p>
      )}
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
