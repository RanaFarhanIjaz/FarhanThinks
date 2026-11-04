# FarhanThinks

Next.js (App Router) + Tailwind v4 + Firebase Realtime Database articles + Firestore comments + Web3Forms contact.

## Run locally
1. `npm install`
2. Fill in `.env.local` (see `.env.example`)
3. `npm run dev` -> http://localhost:3000

## Run with Docker
1. Make sure `.env.local` contains the Firebase values and any optional Web3Forms key.
2. Run `docker compose up --build`
3. Open http://localhost:3000. Stop the container with `Ctrl+C`.

## Setup checklist
1. **Firebase**: create a project and web app, enable Realtime Database and Google Authentication, then copy the web config into `.env.local`. Set `NEXT_PUBLIC_FIREBASE_DATABASE_URL` to the database URL.
2. **Admin sign-in**: enable Google in Firebase Authentication and add `localhost` plus your deployed site domain to the authorized domains. Set `NEXT_PUBLIC_ADMIN_EMAIL` in `.env.local` to the same Google account email allowed by `database.rules.json`. Public pages are open without sign-in; the admin page is not linked in public navigation and still requires this Google sign-in.
3. **Realtime Database**: publish `database.rules.json` as the Realtime Database rules. Anyone can read published posts; only the configured admin can manage published articles or drafts.
4. **Firestore**: create a database and publish `firestore.rules` for comments.
5. **Contact form**: get a free key at web3forms.com and set `NEXT_PUBLIC_WEB3FORMS_KEY`.
6. **Personalise**: edit `lib/site.js` (bio, tagline, social links).
7. **Write**: visit `/admin`, sign in with the allowed Google account, and create a draft or publish an article. Use **Import my Urdu article** once to copy the existing Urdu post into Realtime Database. The editor supports Markdown and English, Urdu, and Arabic (RTL). New articles are stored in Realtime Database.

## Deploy
Push to GitHub, import the repo in Vercel (or Netlify), add the same variables from `.env.local`
under Environment Variables (including `NEXT_PUBLIC_FIREBASE_DATABASE_URL`), and deploy. Set `NEXT_PUBLIC_SITE_URL` to your live URL.
Every push to `main` redeploys.
