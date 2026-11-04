import { NextResponse } from "next/server";
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
      key: "contact",
      limit: 3,
      window: "1 h",
    });
  } catch (error) {
    console.error("Contact rate limiter error:", error);
    return NextResponse.json(
      { error: "The contact form is temporarily unavailable. Please try again later." },
      { status: 503 }
    );
  }
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many messages were sent. Please try again later." },
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

  const { name, email, message, website } = parsed.body;
  if (website) return NextResponse.json({ success: true });
  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof message !== "string" ||
    !name.trim() ||
    name.trim().length > 100 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    email.length > 254 ||
    !message.trim() ||
    message.trim().length > 5000
  ) {
    return NextResponse.json({ error: "Please provide valid contact details and a message." }, { status: 400 });
  }

  const accessKey = process.env.WEB3FORMS_ACCESS_KEY;
  if (!accessKey) {
    return NextResponse.json(
      { error: "The contact form is not configured yet." },
      { status: 503 }
    );
  }

  try {
    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: accessKey,
        subject: "New message from Farhan Thinks",
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
      }),
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      console.error("Web3Forms rejected the contact message:", result);
      return NextResponse.json(
        { error: "The message could not be sent. Please try again later." },
        { status: 502 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Web3Forms request failed:", error);
    return NextResponse.json(
      { error: "The message could not be sent. Please try again later." },
      { status: 502 }
    );
  }
}
