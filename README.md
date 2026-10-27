<div align="center">
  <img src="public/images/logo.png" alt="Gladiators NGO Logo" width="320" />
  
  <h1>⚔️ GladiConnect</h1>
  <p><strong>A Professional Ecosystem for Social Impact & NGO Operations</strong></p>
  
  [![Next.js](https://img.shields.io/badge/Next.js_16_(App_Router)-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![Firebase](https://img.shields.io/badge/Firebase_Admin-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
  [![Gemini AI](https://img.shields.io/badge/Gemini_2.5_Flash-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
  [![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)
</div>

<br />

## 🌐 Live Demo & Branches
- **Frontend (Web App):** [https://gladiconnect.vercel.app/](https://gladiconnect.vercel.app/)
- **Backend API:** [https://gladiators-ngo.onrender.com/](https://gladiators-ngo.onrender.com/)
- **Next.js Full-Stack Branch:** [`next-ani`](https://github.com/AniruddhaMJois/gladiators-ngo/tree/next-ani) *(Complete Next.js 16 App Router implementation with native API route handlers)*

> _"Bridge the Gap. Amplify Impact."_

**GladiConnect** is a robust, full-stack role-based platform built to connect **NGOs**, **Volunteers**, and **Corporate Funders (CSR)**. Our mission is to facilitate transparent, efficient, and collaborative efforts that advance the **UN Sustainable Development Goals 16 (Peace, Justice & Strong Institutions)** and **17 (Partnerships for the Goals)**.

---

## ⚡ Next.js 16 App Router Implementation

The platform has been fully transitioned to a modern, unified full-stack architecture built with **Next.js 16 App Router** (available on the [`next-ani`](https://github.com/AniruddhaMJois/gladiators-ngo/tree/next-ani) branch).

### Key Architectural Upgrades:
- **Unified Full-Stack Deployment:** Completely eliminates the need for a separate Express backend server (`server/`). All backend endpoints now run directly inside Next.js as native **API Route Handlers** (`src/app/api/...`), enabling single-command full-stack deployments on platforms like Vercel.
- **Native App Router Architecture:** Replaced legacy Vite client-side routing (`react-router-dom`) with Next.js App Router file-system routing (`src/app/page.jsx`, `src/app/login/page.jsx`, `src/app/ngo/dashboard/page.jsx`, etc.) and `next/navigation`.
- **Integrated Server Capabilities:** Directly integrates Google Firebase Firestore Admin SDK and Google Gemini 2.5 Flash via server-side route handlers with optimal static tracing and zero client bundle overhead.
- **SSR & Prerendering Optimization:** Client components are carefully guarded for server-side rendering (SSR), ensuring sub-second build times and fast initial page loads with automatic static optimization.

To run the Next.js implementation:
```bash
git checkout next-ani
npm install
npm run dev
```

---

## 🚀 Key Features

### 🔐 Secure Role-Based Workflows
- **NGOs, Volunteers, and Corporate Funders** have dedicated dashboards and specialized tools.
- Intelligent routing and session management ensures data privacy and strict access control across the platform.

### 🏢 Comprehensive NGO Dashboard
- **Advanced Finance Suite:** Transparent end-to-end expense logging with digital bill/receipt attachments, automatic totals calculations, and campaign-specific financial tracking (Full CRUD support).
- **Campaign Management:** Launch, track, and conclude impact campaigns. Seamlessly link expenses to specific active or ended campaigns for flawless audits.
- **Impact Profile & Gallery:** Manage public-facing organizational details, social links, and an interactive media gallery.
- **Offline Event Logger:** Log activities locally even without an internet connection, preparing for sync once back online.

### 🤝 Volunteer Portal
- **Smart Directory:** Discover NGOs using intelligent domain and geographic filtering.
- **Impact Tracking:** Maintain a living record of volunteered hours and participated campaigns.
- **Gamification (Badges):** The system automatically tracks volunteer hours and dynamically awards digital badges (e.g., *Green Horn*, *Earth Champion*) to encourage and reward social work.
- **Premium PDF Certificates:** Volunteers can generate and download dynamically rendered, high-quality PDF certificates to officially validate their social impact.

### 💬 In-App Messaging & CollabHub
- Real-time direct chat and messaging coordination between NGOs, Volunteers, and Corporate Funders.
- Real-time unread message counters, thread history, and collaborative task coordination.

### 🌍 Accessibility & UI Enhancements
- **Multi-Language Support:** Seamlessly switch the platform interface between English, Hindi, and Kannada to ensure regional inclusivity.
- **Dark/Light Mode:** A fully responsive theme engine that adapts to user preference for optimal viewing in any lighting condition.

### 💼 Corporate CSR Portal
- **Due Diligence Tracker:** Verify NGO credentials (like NGO Darpan IDs), registration status, and compliance data before funding.
- **Compliance Reporting:** Extract clean, accurate impact and financial logs generated directly from the NGO Finance Suite to guarantee transparency.

### 🤖 GladiAssist (AI Chatbot)
- Powered by the **Google Gemini 2.5 Flash API**, GladiAssist is a context-aware virtual assistant.
- It is strictly programmed to answer questions related only to the user's current page and role, maintaining a professional tone, blocking profanity, and securing sensitive database information.

---

## 🛠️ Architecture & Tech Stack

### 1. Next.js Full-Stack Architecture (Branch: `next-ani`)
- **Framework:** Next.js 16 (App Router) + React 19.
- **API Engine:** Native Next.js API Route Handlers (`src/app/api/`) replacing Express.
- **Database:** **Google Firebase Firestore** via `firebase-admin` server SDK.
- **AI Engine:** Google Gemini 2.5 Flash SDK (`@google/generative-ai`).
- **Styling:** Custom Vanilla CSS Design System with Glassmorphism and CSS variables.
- **Deployment:** Single unified deployment on **Vercel**.

### 2. Classic Dual-Tier Architecture (Branch: `main`)
- **Frontend:** React 19 + Vite with client-side routing on **Vercel**.
- **Backend:** Node.js with Express.js REST API on **Render**.
- **Database:** Google Firebase Firestore.

---

## 🎨 Design System

Our UI/UX is built to inspire trust, maintain absolute clarity, and provide a premium feel.

| Element       | Specification | Usage               |
| ------------- | ----------- | -------------------- |
| **Primary**   | `#1A5276` (Deep Ocean Blue) | Primary actions, branding, trust elements |
| **Secondary** | `#1E8449` (Forest Green) | Success states, growth metrics, positive impact |
| **Background**| `#F4F7F6` (Cool Grey) | Clean, distraction-free application backdrop |
| **Typography**| `Outfit` (Google Fonts) | Modern, highly legible sans-serif for all UI text |

- **Glassmorphism:** Elegant, translucent cards providing depth.
- **Micro-interactions:** Smooth hover states, transition effects, and intuitive modal overlays.

---

## 📂 Project Structure

### Next.js App Router Structure (`next-ani` branch)
```text
gladiconnect/
├── next.config.mjs            # Next.js configuration
├── jsconfig.json              # Path aliases (@/* -> ./src/*)
├── package.json               # Full-stack dependencies & scripts
├── public/                    # Static assets & images
│
└── src/
    ├── app/                   # Next.js App Router (Pages & API Routes)
    │   ├── layout.jsx         # Root layout with fonts & client providers
    │   ├── page.jsx           # Landing page
    │   ├── login/             # Authentication & role-based login
    │   ├── messages/          # CollabHub messaging center
    │   ├── ngo/               # NGO onboarding, dashboard, profile
    │   ├── volunteer/         # Volunteer onboarding, dashboard, profile
    │   ├── company/           # Corporate CSR onboarding, dashboard, profile, search
    │   └── api/               # Native Next.js API Route Handlers
    │       ├── auth/          # Login, Register, OTP verification, badges
    │       ├── chat/          # Inbox, messages, unread counts
    │       ├── chatbot/       # Gemini AI GladiAssist route handler
    │       ├── programs/      # Programs & campaign lifecycle
    │       ├── applications/  # Volunteer applications & approvals
    │       ├── finance/       # Financial reports, donations, expenses, campaigns
    │       ├── logs/          # Activity & impact logging
    │       └── users/         # NGO directory, search, and statistics
    │
    ├── components/            # Reusable UI components, Modals, Providers
    ├── context/               # Global state (Auth, Theme, Toast, Confirm)
    ├── lib/                   # Firebase admin, API base config, helpers
    └── views/                 # Core view components ported from Vite
```

### Classic Dual-Tier Structure (`main` branch)
```text
gladiators-ngo/
├── server/                    # Node.js + Express Backend
│   ├── routes/                # REST API Endpoints (/api/finance, /api/auth, etc.)
│   ├── firebase.js            # Firebase Admin SDK Initialization
│   └── server.js              # Server entry point & configuration
│
├── src/                       # React 19 Frontend
│   ├── components/            # Reusable UI components & Chatbot
│   ├── context/               # Global State (Auth, Theme, Confirm Dialogs)
│   ├── pages/                 # Role-based Dashboards & Onboarding Flows
│   │   ├── ngo/               # NGO-specific tools (Finance Suite, Campaigns)
│   │   ├── volunteer/         # Volunteer discovery & tracking
│   │   └── company/           # Corporate CSR verification tools
│   ├── App.jsx                # Routing & Authentication Guards
│   └── index.css              # Global Design System tokens
│
└── package.json               # Frontend dependencies & scripts
```

---

> 💡 **Next.js Implementation:** The complete Next.js 16 App Router implementation with native API route handlers is available on the [`next-ani`](https://github.com/AniruddhaMJois/gladiators-ngo/tree/next-ani) branch.

## 👥 Team Gladiators

Built with ❤️ and purpose by **Team Gladiators** from Vidya Vardhaka College of Engineering, Mysuru.

> _"Alone we can do so little; together we can do so much."_ — Helen Keller
