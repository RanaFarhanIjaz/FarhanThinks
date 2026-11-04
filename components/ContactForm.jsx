"use client";

import { useState } from "react";

const inputCls =
  "w-full rounded-md border border-neutral-300 bg-transparent px-3 py-2 text-sm " +
  "placeholder:text-neutral-400 dark:border-neutral-700";

export default function ContactForm() {
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [errorMessage, setErrorMessage] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    if (data.botcheck) return;

    setStatus("sending");
    setErrorMessage("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          website: data.botcheck,
          name: data.name,
          email: data.email,
          message: data.message,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "The message could not be sent.");
      form.reset();
      setStatus("sent");
    } catch (error) {
      console.error("Contact form submission error:", error);
      setErrorMessage(error.message || "The message didn't send. Please try again later.");
      setStatus("error");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <input name="name" className={inputCls} placeholder="Your name" aria-label="Your name" required />
      <input name="email" type="email" className={inputCls} placeholder="Your email" aria-label="Your email" required />
      <textarea name="message" rows={5} className={inputCls} placeholder="Your message" aria-label="Your message" required />
      <input type="checkbox" name="botcheck" className="hidden" tabIndex={-1} aria-hidden="true" />
      <button
        disabled={status === "sending"}
        className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-accent-soft dark:text-night"
      >
        {status === "sending" ? "Sending..." : "Send message"}
      </button>
      {status === "sent" && <p role="status" className="text-sm text-green-700 dark:text-green-400">Message sent. I'll reply by email.</p>}
      {status === "error" && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {errorMessage}
        </p>
      )}
    </form>
  );
}
