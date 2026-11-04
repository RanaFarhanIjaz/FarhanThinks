import { Github, Linkedin } from "lucide-react";
import ContactForm from "@/components/ContactForm";
import { site } from "@/lib/site";

export const metadata = { title: "About" };

const icons = { github: Github, linkedin: Linkedin };

export default function About() {
  return (
    <div className="py-10">
      <h1 className="font-serif text-4xl font-semibold tracking-tight">About</h1>

      <div className="mt-6 space-y-4 text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
        {site.bio.map((p) => <p key={p}>{p}</p>)}
      </div>

      <h2 className="mt-12 font-serif text-2xl font-semibold">Topics</h2>
      <ul className="mt-4 list-disc space-y-1 pl-5 text-neutral-700 dark:text-neutral-300">
        {site.topics.map((t) => <li key={t}>{t}</li>)}
      </ul>

      <h2 className="mt-12 font-serif text-2xl font-semibold">Find me online</h2>
      <div className="mt-4 flex gap-2">
        {Object.entries(site.socials).map(([key, href]) => {
          const Icon = icons[key];
          return (
            <a key={key} href={href} target="_blank" rel="noopener noreferrer" aria-label={key}
              className="rounded-md border border-neutral-300 p-2 text-neutral-600 hover:text-ink dark:border-neutral-700 dark:text-neutral-400 dark:hover:text-white">
              <Icon size={18} />
            </a>
          );
        })}
      </div>

      <h2 className="mt-12 font-serif text-2xl font-semibold">Get in touch</h2>
      <p className="mb-5 mt-2 text-neutral-600 dark:text-neutral-400">
        Questions, ideas, or a project in mind? Send a message.
      </p>
      <ContactForm />
    </div>
  );
}
