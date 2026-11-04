# FarhanThinks

Next.js (App Router) + Tailwind v4 + Firebase Firestore + Web3Forms contact.

## Run locally
1. `npm install`
2. Fill in `.env.local` (see `.env.example`)
3. `npm run dev` -> http://localhost:3000

## Run with Docker
1. Make sure `.env.local` contains the Firebase values and any optional Web3Forms key.
2. Run `docker compose up --build`
3. Open http://localhost:3000. Stop the container with `Ctrl+C`.

## Setup checklist
1. **Firebase**: create a project, add a Web app, copy the config into `.env.local`.
2. **Admin sign-in**: enable Google in Firebase Authentication and add `localhost` plus your deployed site domain to the authorized domains. Set `NEXT_PUBLIC_ADMIN_EMAIL` in `.env.local` to the same Google account email allowed by `firestore.rules`. Public pages are open without sign-in; the admin page is not linked in public navigation and still requires this Google sign-in.
3. **Firestore**: create a database, then paste `firestore.rules` into Firestore > Rules and Publish. The rules allow the configured admin to manage posts, and let everyone read published posts.
4. **Contact form**: get a free key at web3forms.com and set `NEXT_PUBLIC_WEB3FORMS_KEY`.
5. **Personalise**: edit `lib/site.js` (bio, tagline, social links).
6. **Write**: visit `/admin` directly, sign in with the allowed Google account, and create a draft or publish an article. The editor supports Markdown and English, Urdu, and Arabic (RTL). Existing `.mdx` files in `content/articles/` continue to work.

## Deploy
Push to GitHub, import the repo in Vercel (or Netlify), add the same variables from `.env.local`
under Environment Variables, and deploy. Set `NEXT_PUBLIC_SITE_URL` to your live URL.
Every push to `main` redeploys.
