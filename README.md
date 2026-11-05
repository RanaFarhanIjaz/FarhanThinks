# FarhanThinks

Next.js (App Router) + Tailwind v4 + file-based Markdown articles + Firestore comments + Web3Forms contact.

## Run locally
1. `npm install`
2. Fill in `.env.local` (see `.env.example`)
3. `npm run dev` -> http://localhost:3000

## Run with Docker
1. Make sure `.env.local` contains Firebase client values. Set the server-only values from `.env.example` for rate-limited comments and contact forms.
2. Run `docker compose up --build`
3. Open http://localhost:3000. Stop the container with `Ctrl+C`.

## Setup checklist
1. **Firebase**: create a project and web app, enable Firestore, then copy the web config into `.env.local`. Firebase is used for comments only; article content is stored in this repository.
2. **Firestore**: create a database and publish `firestore.rules` for comments.
3. **Rate limiting**: create an Upstash Redis database and set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`. Comments are limited to 5 submissions per IP per 10 minutes; contact messages are limited to 3 per IP per hour. Both endpoints also validate input, check request origin, and reject oversized bodies.
4. **Server credentials**: add a Firebase service-account JSON as `FIREBASE_SERVICE_ACCOUNT_JSON` and a Web3Forms key as `WEB3FORMS_ACCESS_KEY` in server environment settings. Never commit these credentials. Comment creation goes through the rate-limited server endpoint; Firestore rules allow public reads and block direct client writes.
5. **DDoS protection**: enable Vercel Firewall/DDOS protections for the deployed domain and add rate-limit rules for `/api/*`. Application rate limits protect comment and contact submissions; they do not replace network-level DDoS protection.
6. **Personalise**: edit `lib/site.js` (bio, tagline, social links).
7. **Write and publish**: add a Markdown file with frontmatter to `content/articles/`. Commit and push it; Vercel or Netlify rebuilds the site and publishes it at `/articles/<filename>`.

## Deploy
Import the repo in Vercel (or Netlify), add the Firebase web settings and the server-only variables
(`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `FIREBASE_SERVICE_ACCOUNT_JSON`, and `WEB3FORMS_ACCESS_KEY`) in Environment Variables, and deploy. Set `NEXT_PUBLIC_SITE_URL` to your live URL.
Every push to `main` redeploys.
