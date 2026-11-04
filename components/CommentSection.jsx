"use client";

import { useEffect, useState } from "react";
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

const inputCls =
  "w-full rounded-md border border-neutral-300 bg-transparent px-3 py-2 text-sm " +
  "placeholder:text-neutral-400 dark:border-neutral-700";

export default function CommentSection({ slug }) {
  const [comments, setComments] = useState([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | error

  useEffect(() => {
    const q = query(collection(db, "articles", slug, "comments"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => setComments(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (err) => console.error("Comments listener error:", err)
    );
    return unsub;
  }, [slug]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (honeypot) return;
    const n = name.trim();
    const m = message.trim();
    if (!n || !m) return;

    setStatus("sending");
    try {
      await addDoc(collection(db, "articles", slug, "comments"), {
        name: n.slice(0, 60),
        message: m.slice(0, 1000),
        createdAt: serverTimestamp(),
      });
      setName("");
      setMessage("");
      setStatus("idle");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  }

  return (
    <section className="mt-16 border-t border-neutral-200 pt-10 dark:border-neutral-800" aria-labelledby="comments-heading">
      <h2 id="comments-heading" className="mb-6 font-serif text-2xl font-semibold">
        Comments ({comments.length})
      </h2>

      <form onSubmit={handleSubmit} className="mb-10 space-y-3">
        <input className={inputCls} placeholder="Your name" aria-label="Your name" value={name}
          maxLength={60} onChange={(e) => setName(e.target.value)} required />
        <textarea className={inputCls} placeholder="Share your thoughts" aria-label="Your comment" rows={4}
          value={message} maxLength={1000} onChange={(e) => setMessage(e.target.value)} required />
        <input tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" name="website"
          value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
        <button
          disabled={status === "sending"}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-accent-soft dark:text-night"
        >
          {status === "sending" ? "Posting..." : "Post comment"}
        </button>
        {status === "error" && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            Your comment wasn't posted. Check your connection and try again.
          </p>
        )}
      </form>

      <ul className="space-y-6">
        {comments.map((c) => (
          <li key={c.id}>
            <div className="flex items-baseline gap-2 text-sm">
              <span className="font-medium">{c.name}</span>
              <span className="text-neutral-500">
                {c.createdAt?.toDate().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            </div>
            <p className="mt-1 whitespace-pre-wrap text-neutral-700 dark:text-neutral-300">{c.message}</p>
          </li>
        ))}
        {comments.length === 0 && <p className="text-sm text-neutral-500">No comments yet. Start the conversation.</p>}
      </ul>
    </section>
  );
}
