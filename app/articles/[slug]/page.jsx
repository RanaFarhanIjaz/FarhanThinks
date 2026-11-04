import RealtimeDatabaseArticle from "@/components/RealtimeDatabaseArticle";

export const dynamicParams = true;

export default async function ArticlePage({ params }) {
  const { slug } = await params;
  return <RealtimeDatabaseArticle slug={slug} />;
}
