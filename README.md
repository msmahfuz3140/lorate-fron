# Roulette Prediction Platform - Frontend Application (`sloot-frontend`)

Production-ready Next.js 16 (App Router) frontend interface with React 19, TypeScript, and Tailwind CSS. Built for serverless deployment on **Vercel** with dedicated backend API connectivity.

---

## 📑 Table of Contents
1. [Overview & Visual Design](#-overview--visual-design)
2. [Deployment Architecture](#-deployment-architecture)
3. [Environment Configuration](#-environment-configuration)
4. [Vercel Deployment Guide](#-vercel-deployment-guide)
5. [Local Development Commands](#-local-development-commands)
6. [Authentication & Secure Session Handling](#-authentication--secure-session-handling)
7. [Admin & Moderator Portals](#-admin--moderator-portals)
8. [Production Readiness Checklist](#-production-readiness-checklist)

---

## 🎨 Overview & Visual Design
- **Aesthetic**: Premium cyberpunk telemetry dashboard featuring dark obsidian palettes (`#06080d`), electric amber (`#f59e0b`), European roulette crimson (`#ef4444`), and verified emerald (`#10b981`).
- **Typography**: Google Fonts `Orbitron` display typography paired with `Rajdhani` and `Inter` for crisp telemetry readability.
- **Dynamic Elements**: Real-time rotating strategy ticker, live table stream previews (Evolution Gaming & Pragmatic Play), and interactive subscription selection cards.
- **Access Gating**: Active subscription validation gating access to `/dashboard/tool` with non-blocking `/plans` modals for guests and expired members.

---

## 🏛️ Deployment Architecture

The frontend is structured to run decoupled from the Express backend:
- **Hosting**: Vercel Serverless Edge network.
- **Public Domain**: `https://roulette.tools`
- **Backend API Endpoint**: `https://api.roulette.tools/api/v1`
- **Session Transport**: HTTP-only authorization Bearer tokens stored in browser memory/localStorage with automatic fallback to secure HTTPS cookies (`sloot_token`).

---

## 🔑 Environment Configuration

Create `.env.local` for local development or configure in Vercel Project Settings:

```env
# Fully qualified URL to the Express backend API (no trailing slash)
NEXT_PUBLIC_API_URL=https://api.roulette.tools/api/v1

# Public URL of this Next.js frontend application (no trailing slash)
NEXT_PUBLIC_APP_URL=https://roulette.tools
```

See [.env.example](file:///d:/PH-batch-13/Personal/Personal%20Project/tools/Rollate%20Tools%20project/sloot-frontend/.env.example) for placeholder definitions.

---

## 🚢 Vercel Deployment Guide

1. **Connect Repository**:
   - Push your source code to GitHub / GitLab / Bitbucket.
   - In Vercel, select **Add New Project** and import the `sloot-frontend` repository.
2. **Framework Preset**:
   - Vercel automatically detects **Next.js**.
   - Build Command: `next build`
   - Output Directory: `.next`
3. **Configure Environment Variables**:
   - Under **Settings → Environment Variables**, add:
     - `NEXT_PUBLIC_API_URL`: `https://api.roulette.tools/api/v1`
     - `NEXT_PUBLIC_APP_URL`: `https://roulette.tools`
4. **Deploy & Custom Domain**:
   - Click **Deploy**.
   - Under **Settings → Domains**, assign your production apex or subdomain (e.g. `roulette.tools`).
   - Add the corresponding CNAME or A records to your DNS registrar (Cloudflare / Namecheap / GoDaddy).
   - Vercel provisions an automated Let's Encrypt SSL certificate.

---

## ⚡ Local Development Commands

| Command | Description |
| :--- | :--- |
| `npm run dev` | Runs local dev server on [http://localhost:3000](http://localhost:3000) using Turbopack. |
| `npm run build` | Compiles production bundle with static page generation and typechecking. |
| `npm run lint` | Runs ESLint 9 validation across all React components and pages (0 errors). |
| `npm start` | Runs local production preview server. |
| `npm audit` | Audits third-party packages for vulnerabilities (0 vulnerabilities). |

---

## 🔐 Authentication & Secure Session Handling

- **Client Authentication Service**: Managed via `src/lib/auth-client.ts`.
- **Dual Verification**: Supports registration and verification via either Email OTP or Phone SMS OTP.
- **Secure Cookie Flag**: Session cookies are automatically tagged with `; Secure` whenever served over HTTPS (`window.location.protocol === 'https:'`).
- **Direct CSV Exports**: Export buttons for admin financial and referral reports automatically pass authentication credentials to allow direct browser downloads without UI interception.

---

## 🛡️ Admin & Moderator Portals

- **Main Admin Dashboard** (`/admin`): Complete system overview, active subscription counters, financial reporting, and activity audit logs.
- **Dual Approvals** (`/admin/dual-approvals`): Two-person integrity rule requiring two distinct Main Admins to approve high-risk actions (role promotions, policy changes).
- **Payment Reconciliation** (`/admin/payments`): Search, filter, and inspect blockchain orders snapshot from NOWPayments.
- **Moderator Dashboard** (`/moderator`): Self-service referral tracking, unique affiliate link generation, customer attribution lists, and 50% commission ledger telemetry with non-custodial disclosure.

---

## ✅ Production Readiness Checklist

- [x] Next.js 16 build passing with 30 pre-rendered static routes.
- [x] ESLint passing with 0 errors.
- [x] All dead button placeholders replaced with functional routing.
- [x] 0 audit vulnerabilities in dependencies.
- [x] Decoupled API environment variable configuration.
- [x] Secure cookie transport over HTTPS.
