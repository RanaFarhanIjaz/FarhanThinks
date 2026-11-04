import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllArticles, getArticle, formatDate } from "@/lib/articles";
import { site } from "@/lib/site";
import ShareButtons from "@/components/ShareButtons";
import CommentSection from "@/components/CommentSection";
import FirestoreArticle from "@/components/FirestoreArticle";

export const dynamicParams = true;

export function generateStaticParams() {
  return getAllArticles().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const a = getArticle(slug);
  if (!a) return {};
  return {
    title: a.title,
    description: a.description,
    openGraph: { title: a.title, description: a.description, type: "article", publishedTime: a.date },
  };
}

export default async function ArticlePage({ params }) {
  const { slug } = await params;
  const a = getArticle(slug);
  if (!a) return <FirestoreArticle slug={slug} />;
  const url = `${site.url}/articles/${a.slug}`;
  const direction = a.language === "ur" || a.language === "ar" ? "rtl" : "ltr";

  return (
    <article className="pt-6">
      <Link href="/" className="text-sm text-neutral-500 hover:text-ink dark:hover:text-white">
        All articles
      </Link>
      <header className="mb-10 mt-6" dir={direction}>
        <h1 className="font-serif text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">{a.title}</h1>
        <p className="mt-4 text-sm text-neutral-500">
          {formatDate(a.date)} · {a.readTime} min read
          {a.tags.length > 0 && <> · {a.tags.join(", ")}</>}
        </p>
      </header>

      <div dir={direction} lang={a.language || "en"} className="prose prose-neutral max-w-none dark:prose-invert">
        <MDXRemote source={a.content} />
      </div>

      <div className="mt-12">
        <ShareButtons url={url} title={a.title} />
      </div>

      <CommentSection slug={a.slug} />
    </article>
  );
}
