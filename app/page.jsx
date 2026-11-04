import ArticleFeed from "@/components/ArticleFeed";
import { getAllArticles } from "@/lib/articles";
import { site } from "@/lib/site";

export default function Home() {
  const articles = getAllArticles();
  return (
    <>
      <section className="py-14 sm:py-20">
        <h1 className="font-serif text-5xl font-semibold tracking-tight sm:text-6xl">{site.name}</h1>
        <p className="mt-5 max-w-lg text-lg leading-relaxed text-neutral-600 dark:text-neutral-400">{site.tagline}</p>
      </section>
      <ArticleFeed articles={articles} />
    </>
  );
}
