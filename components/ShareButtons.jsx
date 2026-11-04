"use client";

import { useState } from "react";
import { Linkedin, Link2, Check } from "lucide-react";

export default function ShareButtons({ url, title }) {
  const [copied, setCopied] = useState(false);
  const u = encodeURIComponent(url);

  const links = [
    { label: "Share on LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`, Icon: Linkedin },
  ];

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  const btn =
    "rounded-md p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white";

  return (
    <div className="flex items-center gap-1">
      <span className="mr-2 text-sm text-neutral-500">Share</span>
      {links.map(({ label, href, Icon }) => (
        <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className={btn}>
          <Icon size={18} />
        </a>
      ))}
      <button onClick={copy} aria-label="Copy link" className={btn}>
        {copied ? <Check size={18} /> : <Link2 size={18} />}
      </button>
    </div>
  );
}
