import "./globals.css";
import Link from "next/link";
import ThemeProvider from "@/components/ThemeProvider";
import ThemeToggle from "@/components/ThemeToggle";
import { site } from "@/lib/site";

export const metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.name, template: `%s | ${site.name}` },
  description: site.tagline,
  openGraph: { title: site.name, description: site.tagline, siteName: site.name, type: "website" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <header className="mx-auto flex max-w-2xl items-center justify-between px-6 py-6">
            <Link href="/" className="font-serif text-lg font-semibold tracking-tight">
              {site.name}
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/about" className="text-neutral-600 hover:text-ink dark:text-neutral-400 dark:hover:text-white">
                About
              </Link>
              <ThemeToggle />
            </nav>
          </header>
          <main className="mx-auto max-w-2xl px-6 pb-24">{children}</main>
          <footer className="mx-auto max-w-2xl px-6 pb-12 text-sm text-neutral-500">
            © {new Date().getFullYear()} {site.name}
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
