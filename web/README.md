# DermaScan Web

DermaScan Web is a polished Next.js dashboard for AI-assisted acne analysis, scan history, progress tracking, skincare recommendations, and dermatologist-facing review flows.

It connects to the deployed DermaScan API for image analysis and uses Supabase for authentication and scan storage.

## Highlights

- AI scan flow connected to the deployed Railway backend
- Persistent scan history with saved images, prediction summary, and timestamps
- Dashboard with usage metrics, streaks, latest scan snapshot, and progress charts
- Result page with structured AI analysis, product suggestions, and home remedies
- Product catalog with sponsored and organic recommendations
- Progress tracking and before/after comparison
- Weekly report flow
- Settings for language, reminder preferences, ingredient blacklist, and skin type
- Dermatologist portal entry point
- Built-in medical disclaimer across the app

## Stack

- Next.js 16
- React 19
- TypeScript
- Supabase Auth and Database
- Railway deployment
- Recharts
- Lucide icons

## Live Services

- Web app: [https://dermascan-web-production.up.railway.app](https://dermascan-web-production.up.railway.app)
- API docs: [https://dermascan-api-production.up.railway.app/docs](https://dermascan-api-production.up.railway.app/docs)

## Core User Flows

### Patient app

- Sign up or log in
- Upload a face image
- Run AI analysis
- Save the scan to history
- Review severity, confidence, routine, products, and remedies
- Track progress over time
- Compare older and newer scans

### Settings and personalization

- Choose preferred routine language
- Set skin type
- Manage ingredient blacklist
- Toggle reminders
- View freemium or Pro state

### Dermatologist support

- Separate dermatologist login route
- Patient linking via code
- Patient progress snapshot view
- Prescription and recommendation notes

## Project Structure

```text
web/
  app/                Next.js App Router pages
  components/         Shared UI building blocks
  lib/                API client, Supabase helpers, app data utilities, types
  public/             Static assets
  README.md
```

Important routes:

- `/dashboard`
- `/scan`
- `/results`
- `/history`
- `/progress`
- `/products`
- `/remedies`
- `/compare`
- `/weekly-report`
- `/settings`
- `/dermatologists`
- `/dermatologist/login`

## Environment Variables

Create `D:\PROJECTS\dermascan\web\.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=https://dermascan-api-production.up.railway.app
```

## Local Development

From `D:\PROJECTS\dermascan\web`:

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Validation

Run the main checks from `D:\PROJECTS\dermascan\web`:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Deployment

This project is intended to be deployed from the `web` directory on Railway.

Typical deploy flow:

```bash
git push origin main
railway up -s dermascan-web
```

Make sure the Railway service has the same public environment variables as local development.

## Notes

- Scan history depends on a valid Supabase `scans` table and a configured `scan-images` storage bucket for the best persistence behavior.
- If image storage upload is unavailable, the app falls back to a smaller inline image so recent scans can still appear in history.
- This tool is not a medical diagnosis system. Users should consult a dermatologist for severe, painful, or persistent skin conditions.

## Status

Current focus areas:

- keeping scan image persistence reliable across sessions
- improving API-backed product and remedy recommendations
- polishing the production deployment flow for both web and API
