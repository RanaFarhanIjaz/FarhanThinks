import { NextResponse } from "next/server";
import { getArticle } from "@/lib/articles";

export function GET() {
  const article = getArticle("chotay-chotay-firaun");
  if (!article) {
    return NextResponse.json({ error: "Article not found." }, { status: 404 });
  }
  return NextResponse.json(article);
}
