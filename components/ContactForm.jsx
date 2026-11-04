"use client";

import { useState } from "react";

const inputCls =
  "w-full rounded-md border border-neutral-300 bg-transparent px-3 py-2 text-sm " +
  "placeholder:text-neutral-400 dark:border-neutral-700";

export default function ContactForm() {
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error

  async function onSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    if (data.botcheck) return;

    setStatus("sending");
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: process.env.NEXT_PUBLIC_WEB3FORMS_KEY,
          subject: "New message from Farhan Thinks",
          name: data.name,
          email: data.email,
          message: data.message,
        }),
      });
      const json = await res.json();
      if (json.success) {
        form.reset();
        setStatus("sent");
      } else setStatus("error");
    } catch {
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
          The message didn't send. Try again, or reach me on one of the links above.
        </p>
      )}
    </form>
  );
}
