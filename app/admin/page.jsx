"use client";

import { useEffect, useMemo, useState } from "react";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from "firebase/auth";
import { get, onValue, ref, remove, set } from "firebase/database";
import { auth, rtdb } from "@/lib/firebase";
import MarkdownContent from "@/components/MarkdownContent";

const adminEmail = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || "").trim().toLowerCase();
const emptyArticle = {
  title: "",
  slug: "",
  description: "",
  tags: "",
  date: new Date().toISOString().slice(0, 10),
  language: "en",
  content: "",
  status: "draft",
};

function slugify(value) {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function wordCount(value) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

const inputClass =
  "w-full rounded-md border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-700";

export default function AdminPage() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [articles, setArticles] = useState([]);
  const [form, setForm] = useState(emptyArticle);
  const [editingSlug, setEditingSlug] = useState("");
  const [editingPath, setEditingPath] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    document.title = `Write | ${document.title.split(" | ").pop()}`;
    return onAuthStateChanged(
      auth,
      (nextUser) => {
        setAuthChecked(true);
        if (
          nextUser?.emailVerified &&
          nextUser.email?.toLowerCase() === adminEmail
        ) {
          setUser(nextUser);
          setError("");
          return;
        }
        setUser(null);
        if (nextUser) {
          setError("This Google account is not authorized to manage articles.");
          signOut(auth).catch((authError) => console.error("Sign-out error:", authError));
        }
      },
      (authError) => {
        console.error("Authentication listener error:", authError);
        setAuthChecked(true);
        setError("Could not check your sign-in. Please refresh and try again.");
      }
    );
  }, []);

  useEffect(() => {
    if (!user) {
      setArticles([]);
      return undefined;
    }
    const updateArticles = (status) => (snapshot) => {
      const branchArticles = Object.entries(snapshot.val() || {}).map(([slug, article]) => ({
        ...article,
        slug,
        status,
      }));
      setArticles((current) =>
        [
          ...current.filter((article) => article.status !== status),
          ...branchArticles,
        ].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
      );
    };
    const handleError = (listenerError) => {
      console.error("Realtime Database admin listener error:", listenerError);
      setError("Could not load articles. Check that the Realtime Database rules have been published.");
    };
    const stopPublished = onValue(
      ref(rtdb, "articles/published"),
      updateArticles("published"),
      handleError
    );
    const stopDrafts = onValue(
      ref(rtdb, "articles/drafts"),
      updateArticles("draft"),
      handleError
    );
    return () => {
      stopPublished();
      stopDrafts();
    };
  }, [user]);

  useEffect(() => {
    if (!user) return undefined;
    let active = true;

    async function importFirstArticleIfNeeded() {
      try {
        const articleRef = ref(rtdb, "articles/published/chotay-chotay-firaun");
        const existingArticle = await get(articleRef);
        if (existingArticle.exists()) return;

        const response = await fetch("/api/legacy-article");
        if (!response.ok) throw new Error(`Article source returned HTTP ${response.status}`);
        const article = await response.json();
        const now = Date.now();
        await set(articleRef, {
          title: article.title,
          slug: article.slug,
          description: article.description,
          date: article.date,
          tags: article.tags,
          readTime: article.readTime,
          content: article.content,
          language: article.language,
          status: "published",
          createdAt: now,
          updatedAt: now,
        });
        if (active) setMessage("Your Urdu article has been saved to the database.");
      } catch (importError) {
        console.error("Initial article import error:", importError);
        if (active) {
          setError(
            "The article could not be saved or loaded. Publish database.rules.json in Firebase Realtime Database → Rules, and set NEXT_PUBLIC_FIREBASE_DATABASE_URL in Vercel."
          );
        }
      }
    }

    importFirstArticleIfNeeded();
    return () => {
      active = false;
    };
  }, [user]);

  const direction = form.language === "ur" || form.language === "ar" ? "rtl" : "ltr";
  const previewArticle = useMemo(() => form.content, [form.content]);

  function startNewArticle() {
    setForm({ ...emptyArticle, date: new Date().toISOString().slice(0, 10) });
    setEditingSlug("");
    setEditingPath("");
    setMessage("");
    setError("");
    setPreview(false);
  }

  function editArticle(article) {
    setForm({
      title: article.title || "",
      slug: article.slug,
      description: article.description || "",
      tags: (article.tags || []).join(", "),
      date: article.date || new Date().toISOString().slice(0, 10),
      language: article.language || "en",
      content: article.content || "",
      status: article.status || "draft",
    });
    setEditingSlug(article.slug);
    setEditingPath(article.status);
    setMessage("");
    setError("");
    setPreview(false);
  }

  async function handleSignIn() {
    setError("");
    if (!adminEmail) {
      setError("Set NEXT_PUBLIC_ADMIN_EMAIL in .env.local before signing in.");
      return;
    }
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      await signInWithPopup(auth, provider);
    } catch (signInError) {
      if (signInError.code === "auth/popup-blocked") {
        try {
          await signInWithRedirect(auth, new GoogleAuthProvider());
          return;
        } catch (redirectError) {
          console.error("Google redirect sign-in error:", redirectError);
          setError(redirectError.message || "Google sign-in failed. Please try again.");
          return;
        }
      }
      console.error("Google sign-in error:", signInError);
      setError(signInError.message || "Google sign-in failed. Please try again.");
    }
  }

  async function handleSave(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    const slug = editingSlug || slugify(form.slug || form.title) ||
      `article-${form.date}-${Math.random().toString(36).slice(2, 7)}`;
    const title = form.title.trim();
    const content = form.content.trim();
    const description = form.description.trim();
    const tags = [...new Set(form.tags.split(",").map((tag) => tag.trim()).filter(Boolean))].slice(0, 20);

    if (!title || !content) {
      setError("Add a title and article text before saving.");
      return;
    }
    if (title.length > 180 || description.length > 500 || content.length > 100000) {
      setError("The title, summary, or article is longer than the allowed limit.");
      return;
    }

    setSaving(true);
    try {
      const previous = articles.find((article) => article.slug === editingSlug);
      await set(ref(rtdb, `articles/${form.status}/${slug}`), {
        title,
        slug,
        description,
        date: form.date,
        tags,
        readTime: Math.max(1, Math.ceil(wordCount(content) / 200)),
        content,
        language: form.language,
        status: form.status,
        createdAt: previous?.createdAt || Date.now(),
        updatedAt: Date.now(),
      });
      if (editingPath && editingPath !== form.status) {
        await remove(ref(rtdb, `articles/${editingPath}/${slug}`));
      }
      setEditingSlug(slug);
      setEditingPath(form.status);
      setForm((current) => ({ ...current, slug }));
      setMessage(form.status === "published" ? "Article published." : "Draft saved.");
    } catch (saveError) {
      console.error("Article save error:", saveError);
      setError("Could not save this article. Check your connection and Realtime Database rules.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(article) {
    if (!window.confirm(`Delete “${article.title}”? This cannot be undone.`)) return;
    setError("");
    setMessage("");
    try {
      await Promise.all([
        remove(ref(rtdb, `articles/published/${article.slug}`)),
        remove(ref(rtdb, `articles/drafts/${article.slug}`)),
      ]);
      if (editingSlug === article.slug) startNewArticle();
      setMessage("Article deleted.");
    } catch (deleteError) {
      console.error("Article delete error:", deleteError);
      setError("Could not delete this article. Check your connection and Realtime Database rules.");
    }
  }

  if (!authChecked) return <p className="py-16 text-neutral-500">Checking sign-in…</p>;

  if (!user) {
    return (
      <section className="mx-auto max-w-lg py-16">
        <h1 className="font-serif text-4xl font-semibold tracking-tight">Admin sign in</h1>
        <p className="mt-4 text-neutral-600 dark:text-neutral-400">
          Sign in with the authorized Google account to write and manage articles.
        </p>
        {error && <p role="alert" className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}
        {!adminEmail && (
          <p role="alert" className="mt-4 text-sm text-red-600 dark:text-red-400">
            Set NEXT_PUBLIC_ADMIN_EMAIL in .env.local before signing in.
          </p>
        )}
        <button
          onClick={handleSignIn}
          className="mt-6 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white dark:bg-accent-soft dark:text-night"
        >
          Continue with Google
        </button>
      </section>
    );
  }

  return (
    <section className="py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl font-semibold tracking-tight">Article dashboard</h1>
          <p className="mt-2 text-sm text-neutral-500">Signed in as {user.email}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={startNewArticle} className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white dark:bg-accent-soft dark:text-night">
            New article
          </button>
          <button onClick={() => signOut(auth)} className="rounded-md border border-neutral-300 px-4 py-2 text-sm dark:border-neutral-700">
            Sign out
          </button>
        </div>
      </div>

      {message && <p role="status" className="mt-5 text-sm text-green-700 dark:text-green-400">{message}</p>}
      {error && <p role="alert" className="mt-5 text-sm text-red-600 dark:text-red-400">{error}</p>}

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(16rem,1fr)]">
        <form onSubmit={handleSave} className="space-y-4">
          <h2 className="font-serif text-2xl font-semibold">{editingSlug ? "Edit article" : "Write an article"}</h2>
          <label className="block space-y-1 text-sm">
            <span>Title</span>
            <input className={inputClass} value={form.title} maxLength={180} onChange={(event) => {
              const title = event.target.value;
              setForm((current) => ({
                ...current,
                title,
                slug: editingSlug ? current.slug : slugify(title) || current.slug,
              }));
            }} required />
          </label>
          <label className="block space-y-1 text-sm">
            <span>URL slug</span>
            <input className={inputClass} value={form.slug} disabled={Boolean(editingSlug)} onChange={(event) => setForm((current) => ({ ...current, slug: slugify(event.target.value) }))} placeholder="article-url" />
          </label>
          <label className="block space-y-1 text-sm">
            <span>Short summary</span>
            <textarea className={inputClass} value={form.description} maxLength={500} rows={2} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
          </label>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block space-y-1 text-sm">
              <span>Language / direction</span>
              <select className={inputClass} value={form.language} onChange={(event) => setForm((current) => ({ ...current, language: event.target.value }))}>
                <option value="en">English (LTR)</option>
                <option value="ur">Urdu (RTL)</option>
                <option value="ar">Arabic (RTL)</option>
              </select>
            </label>
            <label className="block space-y-1 text-sm">
              <span>Publication date</span>
              <input className={inputClass} type="date" value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} required />
            </label>
            <label className="block space-y-1 text-sm">
              <span>Visibility</span>
              <select className={inputClass} value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}>
                <option value="draft">Draft (private)</option>
                <option value="published">Published (public)</option>
              </select>
            </label>
          </div>
          <label className="block space-y-1 text-sm">
            <span>Tags (comma-separated, optional)</span>
            <input className={inputClass} value={form.tags} onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))} placeholder="Society, Reflection" />
          </label>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="article-content" className="text-sm">Article text (Markdown supported)</label>
              <button type="button" className="text-sm text-accent dark:text-accent-soft" onClick={() => setPreview((current) => !current)}>
                {preview ? "Edit text" : "Preview"}
              </button>
            </div>
            {preview ? (
              <div dir={direction} lang={form.language} className="min-h-64 rounded-md border border-neutral-300 p-4 dark:border-neutral-700">
                {previewArticle ? <MarkdownContent content={previewArticle} /> : <p className="text-sm text-neutral-500">Your preview will appear here.</p>}
              </div>
            ) : (
              <textarea
                id="article-content"
                className={`${inputClass} min-h-80 font-mono leading-relaxed`}
                dir={direction}
                value={form.content}
                onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))}
                placeholder={"Write your article here. You can use Markdown:\n\n**Bold text**\n\n## A section heading"}
                required
              />
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={saving} className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-accent-soft dark:text-night">
              {saving ? "Saving…" : form.status === "published" ? "Publish article" : "Save draft"}
            </button>
            {editingSlug && (
              <button type="button" onClick={startNewArticle} className="rounded-md border border-neutral-300 px-4 py-2 text-sm dark:border-neutral-700">
                Cancel editing
              </button>
            )}
          </div>
        </form>

        <aside>
          <h2 className="font-serif text-2xl font-semibold">Your articles ({articles.length})</h2>
          {articles.length === 0 ? (
            <p className="mt-4 text-sm text-neutral-500">Saved drafts and published posts will appear here.</p>
          ) : (
            <ul className="mt-4 divide-y divide-neutral-200 dark:divide-neutral-800">
              {articles.map((article) => (
                <li key={article.slug} className="py-4">
                  <p className="font-medium">{article.title}</p>
                  <p className="mt-1 text-xs text-neutral-500">
                    {article.status === "published" ? "Published" : "Draft"} · {article.tags?.join(", ") || "No tags"}
                  </p>
                  <div className="mt-3 flex gap-4 text-sm">
                    <button onClick={() => editArticle(article)} className="text-accent dark:text-accent-soft">Edit</button>
                    {article.status === "published" && (
                      <a href={`/articles/${article.slug}`} target="_blank" rel="noopener noreferrer" className="text-neutral-600 dark:text-neutral-400">View</a>
                    )}
                    <button onClick={() => handleDelete(article)} className="text-red-600 dark:text-red-400">Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </section>
  );
}
