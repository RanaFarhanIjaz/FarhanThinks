import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

const dir = path.join(process.cwd(), "content", "articles");

function toDateString(d) {
  if (d instanceof Date) return d.toISOString().slice(0, 10);
  return String(d || "");
}

function parse(file) {
  const slug = file.replace(/\.mdx?$/, "");
  const raw = fs.readFileSync(path.join(dir, file), "utf8");
  const { data, content } = matter(raw);
  return {
    slug,
    title: data.title || slug,
    description: data.description || "",
    date: toDateString(data.date),
    tags: data.tags || [],
    language: data.language || data.lang || "en",
    readTime: Math.max(1, Math.ceil(readingTime(content).minutes)),
    content,
  };
}

export function getAllArticles() {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => /\.mdx?$/.test(f))
    .map(parse)
    .filter((a) => !a.draft)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getArticle(slug) {
  return getAllArticles().find((a) => a.slug === slug) || null;
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
