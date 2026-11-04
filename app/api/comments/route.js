import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDatabase, getAdminFirestore } from "@/lib/server/firebase-admin";
import {
  enforceRateLimit,
  hasValidOrigin,
  readJsonBody,
} from "@/lib/server/rate-limit";

export const runtime = "nodejs";

export async function POST(request) {
  if (!hasValidOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  let rateLimit;
  try {
    rateLimit = await enforceRateLimit(request, {
      key: "comments",
      limit: 5,
      window: "10 m",
    });
  } catch (error) {
    console.error("Comment rate limiter error:", error);
    return NextResponse.json(
      { error: "Comments are temporarily unavailable. Please try again later." },
      { status: 503 }
    );
  }
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "You’ve posted too many comments. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfter) },
      }
    );
  }

  const parsed = await readJsonBody(request);
  if (parsed.error) {
    return NextResponse.json({ error: parsed.error }, { status: parsed.status });
  }

  const { slug, name, message, website } = parsed.body;
  if (website) return NextResponse.json({ success: true });
  if (
    typeof slug !== "string" ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ||
    typeof name !== "string" ||
    typeof message !== "string" ||
    !name.trim() ||
    name.trim().length > 60 ||
    !message.trim() ||
    message.trim().length > 1000
  ) {
    return NextResponse.json({ error: "Please provide a valid name and comment." }, { status: 400 });
  }

  try {
    const article = await getAdminDatabase()
      .ref(`articles/published/${slug}`)
      .get();
    if (!article.exists()) {
      return NextResponse.json({ error: "Comments are only available on published articles." }, { status: 404 });
    }

    await getAdminFirestore()
      .collection("articles")
      .doc(slug)
      .collection("comments")
      .add({
        name: name.trim(),
        message: message.trim(),
        createdAt: FieldValue.serverTimestamp(),
      });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Comment creation error:", error);
    return NextResponse.json(
      { error: "Your comment could not be saved. Please try again later." },
      { status: 503 }
    );
  }
}
