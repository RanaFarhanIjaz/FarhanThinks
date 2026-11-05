import Link from "next/link";

export const metadata = {
  title: "Publishing articles",
};

export default function PublishingPage() {
  return (
    <section className="py-10">
      <h1 className="font-serif text-4xl font-semibold tracking-tight">Publishing articles</h1>
      <p className="mt-4 leading-relaxed text-neutral-600 dark:text-neutral-400">
        Articles are Markdown files in <code>content/articles/</code>. Add or edit an
        article file, then commit and push your changes. The site rebuilds and publishes
        the article automatically.
      </p>
      <p className="mt-4 text-neutral-600 dark:text-neutral-400">
        See the <Link href="/#articles" className="text-accent dark:text-accent-soft">published articles</Link>.
      </p>
    </section>
  );
}
