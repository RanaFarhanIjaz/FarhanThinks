# FarhanThinks

Next.js (App Router) + Tailwind v4 + Firebase Realtime Database articles + Firestore comments + Web3Forms contact.

## Run locally
1. `npm install`
2. Fill in `.env.local` (see `.env.example`)
3. `npm run dev` -> http://localhost:3000

## Run with Docker
1. Make sure `.env.local` contains Firebase client values. Set the server-only values from `.env.example` for rate-limited comments and contact forms.
2. Run `docker compose up --build`
3. Open http://localhost:3000. Stop the container with `Ctrl+C`.

## Setup checklist
1. **Firebase**: create a project and web app, enable Realtime Database and Google Authentication, then copy the web config into `.env.local`. Set `NEXT_PUBLIC_FIREBASE_DATABASE_URL` to the database URL.
2. **Admin sign-in**: enable Google in Firebase Authentication and add `localhost` plus your deployed site domain to the authorized domains. Set `NEXT_PUBLIC_ADMIN_EMAIL` in `.env.local` to the same Google account email allowed by `database.rules.json`. Public pages are open without sign-in; the admin page is not linked in public navigation and still requires this Google sign-in.
3. **Realtime Database**: publish `database.rules.json` as the Realtime Database rules. Anyone can read published posts; only the configured admin can manage published articles or drafts.
4. **Firestore**: create a database and publish `firestore.rules` for comments.
5. **Rate limiting**: create an Upstash Redis database and set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`. Comments are limited to 5 submissions per IP per 10 minutes; contact messages are limited to 3 per IP per hour. Both endpoints also validate input, check request origin, and reject oversized bodies.
6. **Server credentials**: add a Firebase service-account JSON as `FIREBASE_SERVICE_ACCOUNT_JSON` and a Web3Forms key as `WEB3FORMS_ACCESS_KEY` in server environment settings. Never commit these credentials. Comment creation goes through the rate-limited server endpoint; Firestore rules allow public reads and block direct client writes.
7. **DDoS protection**: enable Vercel Firewall/DDOS protections for the deployed domain and add rate-limit rules for `/api/*`. Application rate limits protect comment and contact submissions; they do not replace network-level DDoS protection.
8. **Personalise**: edit `lib/site.js` (bio, tagline, social links).
9. **Write**: visit `/admin`, sign in with the allowed Google account, and create a draft or publish an article. The editor supports Markdown and English, Urdu, and Arabic (RTL). Articles are stored in Realtime Database.

## Deploy
Push to GitHub, import the repo in Vercel (or Netlify), add the public Firebase settings and the server-only variables
(`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `FIREBASE_SERVICE_ACCOUNT_JSON`, and `WEB3FORMS_ACCESS_KEY`) in Environment Variables, and deploy. Set `NEXT_PUBLIC_SITE_URL` to your live URL.
Every push to `main` redeploys.
