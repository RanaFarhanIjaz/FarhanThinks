"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { onValue, ref } from "firebase/database";
import { rtdb } from "@/lib/firebase";
import { site } from "@/lib/site";
import ShareButtons from "@/components/ShareButtons";
import CommentSection from "@/components/CommentSection";
import MarkdownContent from "@/components/MarkdownContent";

function formatArticleDate(date) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default function RealtimeDatabaseArticle({ slug }) {
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    return onValue(
      ref(rtdb, `articles/published/${slug}`),
      (snapshot) => {
        setArticle(snapshot.exists() ? { ...snapshot.val(), slug } : null);
        setLoading(false);
        setLoadError(false);
      },
      (error) => {
        console.error("Realtime Database article listener error:", error);
        setLoadError(true);
        setLoading(false);
      }
    );
  }, [slug]);

  useEffect(() => {
    if (article?.title) document.title = `${article.title} | ${site.name}`;
  }, [article]);

  if (loading) return <p className="py-12 text-neutral-500">Loading article…</p>;
  if (loadError) {
    return <p role="alert" className="py-12 text-red-600 dark:text-red-400">This article could not be loaded. Please try again later.</p>;
  }
  if (!article) {
    return (
      <div className="py-12">
        <p className="text-neutral-600 dark:text-neutral-400">This article isn’t available.</p>
        <Link href="/" className="mt-4 inline-block text-sm text-accent dark:text-accent-soft">Back to all articles</Link>
      </div>
    );
  }

  const direction = article.language === "ur" || article.language === "ar" ? "rtl" : "ltr";
  const date = article.date || new Date(article.updatedAt).toISOString().slice(0, 10);

  return (
    <article className="pt-6">
      <Link href="/" className="text-sm text-neutral-500 hover:text-ink dark:hover:text-white">
        All articles
      </Link>
      <header className="mb-10 mt-6" dir={direction}>
        <h1 className="font-serif text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">{article.title}</h1>
        <p className="mt-4 text-sm text-neutral-500">
          {date ? formatArticleDate(date) : ""} · {article.readTime || 1} min read
          {article.tags?.length > 0 && <> · {article.tags.join(", ")}</>}
        </p>
      </header>

      <div dir={direction} lang={article.language || "en"}>
        <MarkdownContent content={article.content} />
      </div>

      <div className="mt-12">
        <ShareButtons url={`${site.url}/articles/${article.slug}`} title={article.title} />
      </div>
      <CommentSection slug={article.slug} />
    </article>
  );
}
