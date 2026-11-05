import { notFound } from "next/navigation";
import { getAllArticles, getArticle } from "@/lib/articles";
import ArticleContent from "@/components/ArticleContent";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return getAllArticles().map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};

  return {
    title: article.title,
    description: article.description || site.tagline,
  };
}

export default async function ArticlePage({ params }) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  return <ArticleContent article={article} />;
}
