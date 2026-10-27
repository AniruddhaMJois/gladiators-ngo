<div align="center">
  <img src="public/images/logo.png" alt="Gladiators NGO Logo" width="320" />
  
  <h1>⚔️ GladiConnect</h1>
  <p><strong>A Unified Full-Stack Next.js Ecosystem for Social Impact & NGO Operations</strong></p>
  
  [![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![Firebase](https://img.shields.io/badge/Firebase_Admin-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
  [![Gemini AI](https://img.shields.io/badge/Gemini_2.5_Flash-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
</div>

<br />

## 🌐 Live Demo
- **Web App & Native API:** [https://gladiconnect.vercel.app/](https://gladiconnect.vercel.app/)

> _"Bridge the Gap. Amplify Impact."_

**GladiConnect** is a robust, full-stack role-based platform built to connect **NGOs**, **Volunteers**, and **Corporate Funders (CSR)**. Our mission is to facilitate transparent, efficient, and collaborative efforts that advance the **UN Sustainable Development Goals 16 (Peace, Justice & Strong Institutions)** and **17 (Partnerships for the Goals)**.

---

## 🚀 Key Features

### 🔐 Secure Role-Based Workflows
- **NGOs, Volunteers, and Corporate Funders** have dedicated dashboards and specialized tools.
- Native Next.js App Router route guarding and session management ensures data privacy and strict access control across the platform.

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

### 💬 Direct Real-Time Messaging & Collaboration Hub
- Dedicated in-app messaging between NGOs, Volunteers, and Corporate Funders.
- Unread message counters, instant chat threads, and collaborative task coordination.

### 🌍 Accessibility & UI Enhancements
- **Multi-Language Support:** Seamlessly switch the platform interface between English, Hindi, and Kannada to ensure regional inclusivity.
- **Dark/Light Mode:** A fully responsive theme engine that adapts to user preference for optimal viewing in any lighting condition.

### 💼 Corporate CSR Portal
- **Due Diligence Tracker:** Verify NGO credentials (like NGO Darpan IDs), registration status, and compliance data before funding.
- **Compliance Reporting:** Extract clean, accurate impact and financial logs generated directly from the NGO Finance Suite to guarantee transparency.

### 🤖 GladiAssist (AI Chatbot)
- Powered by the **Google Gemini 2.5 Flash API**, GladiAssist is a context-aware virtual assistant running as a native Next.js API Route Handler.
- It is strictly programmed to answer questions related only to the user's current page and role, maintaining a professional tone, blocking profanity, and securing sensitive database information.

---

## 🛠️ Architecture & Tech Stack

GladiConnect is fully unified into a single full-stack **Next.js** application:

### Next.js App Router
- **Full-Stack Framework:** Next.js 16 (App Router) with React 19.
- **API Route Handlers:** Built directly in `src/app/api/` (no separate Express server required).
- **Styling:** Custom Design System featuring Glassmorphism, tailored color palettes, and micro-animations.
- **Database:** **Google Firebase Firestore** via `firebase-admin` server SDK.
- **Deployment:** Single unified deployment on **Vercel**.

---

## 📂 Project Structure

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

---

## 🏃 Getting Started

### Prerequisites
- Node.js 18+ or 20+
- Firebase Service Account Key (`firebase-key.json` or `FIREBASE_SERVICE_ACCOUNT` env var)
- Google Gemini API Key (`GEMINI_API_KEY` env var)

### Installation
```bash
git clone https://github.com/AniruddhaMJois/gladiators-ngo.git
cd gladiators-ngo
npm install
```

### Environment Variables
Create a `.env` file in the root directory:
```env
GEMINI_API_KEY=your_gemini_api_key
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...} # Optional if firebase-key.json is present
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
```

### Development
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
npm run build
npm start
```


new implementation : using next.js
---

## 👥 Team Gladiators

Built with ❤️ and purpose by **Team Gladiators** from Vidya Vardhaka College of Engineering, Mysuru.

> _"Alone we can do so little; together we can do so much."_ — Helen Keller
