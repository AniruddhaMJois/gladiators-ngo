<div align="center">
  <img src="public/images/logo.png" alt="Gladiators NGO Logo" width="320" />
  
  <h1>⚔️ GladiConnect</h1>
  <p><strong>A Professional Ecosystem for Social Impact & NGO Operations</strong></p>
  
  [![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![NodeJS](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
  [![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
  [![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)
</div>

<br />

> _"Bridge the Gap. Amplify Impact."_

**GladiConnect** is a robust, full-stack role-based platform built to connect **NGOs**, **Volunteers**, and **Corporate Funders (CSR)**. Our mission is to facilitate transparent, efficient, and collaborative efforts that advance the **UN Sustainable Development Goals 16 (Peace, Justice & Strong Institutions)** and **17 (Partnerships for the Goals)**.

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

### 💼 Corporate CSR Portal
- **Due Diligence Tracker:** Verify NGO credentials (like NGO Darpan IDs), registration status, and compliance data before funding.
- **Compliance Reporting:** Extract clean, accurate impact and financial logs generated directly from the NGO Finance Suite to guarantee transparency.

### 🤖 GladiAssist (AI Chatbot)
- Powered by the **Google Gemini 2.5 Flash API**, GladiAssist is a context-aware virtual assistant.
- It is strictly programmed to answer questions related only to the user's current page and role, maintaining a professional tone, blocking profanity, and securing sensitive database information.

---

## 🛠️ Architecture & Tech Stack

GladiConnect recently underwent a massive architectural upgrade for production deployment:

### Frontend (Live on Vercel)
- **Framework:** React 19 + Vite for lightning-fast HMR and optimized builds.
- **Styling:** Custom Vanilla CSS Design System featuring Glassmorphism, tailored color palettes, and micro-animations.
- **Deployment:** Globally deployed and auto-scaling on **Vercel**.

### Backend (Live on Render)
- **Runtime:** Node.js with Express.js REST API.
- **Database:** Migrated to **Google Firebase Firestore** (a cloud-hosted, highly scalable NoSQL database) for real-time capabilities and enhanced security.
- **Deployment:** Continuously deployed on **Render** via GitHub webhooks.

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

## 👥 Team Gladiators

Built with ❤️ and purpose by **Team Gladiators** from Vidya Vardhaka College of Engineering, Mysuru.

> _"Alone we can do so little; together we can do so much."_ — Helen Keller
