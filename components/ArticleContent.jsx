import Link from "next/link";
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

export default function ArticleContent({ article }) {
  const direction = article.language === "ur" || article.language === "ar" ? "rtl" : "ltr";

  return (
    <article className="pt-6">
      <Link href="/" className="text-sm text-neutral-500 hover:text-ink dark:hover:text-white">
        All articles
      </Link>
      <header className="mb-10 mt-6" dir={direction}>
        <h1 className="font-serif text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">{article.title}</h1>
        <p className="mt-4 text-sm text-neutral-500">
          {article.date ? formatArticleDate(article.date) : ""} · {article.readTime} min read
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
