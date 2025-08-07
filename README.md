# 🚀 StartupHQ

**StartupHQ** is a full-stack platform built to help founders ideate, validate, and manage early-stage startups efficiently using an AI-powered and structured workflow.

---

## 📌 Features

- 🧠 **Idea Generation** – AI-powered startup idea generation based on categories and prompts.
- 🎯 **Lean Canvas** – Save and manage lean canvas blocks per startup.
- ✅ **Validation Engine** – Log, edit, and validate your startup hypotheses with structured notes and status.
- 🧩 **Snapshot Page** – Central hub showing your startup's name, description, team, and pitch deck insights.
- 📊 **Pitch Deck Builder** – Create, save, and visualize pitch slides (Problem, Solution, Market Size, etc).
- 📅 **Roadmap** – Plan and track your startup's tasks, status, and deadlines (via drag-and-drop board).
- 👥 **User Management** – Users are linked to their startup, no sign-in required for guests.
- 📦 **Appwrite Backend** – Integrated with Appwrite for auth, DB, and storage.

---

## 🛠️ Tech Stack

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS
- **State Management:** React Context API
- **Backend:** Appwrite (Database, Auth)
- **Notifications:** `sonner` and `react-hot-toast`
- **UI Components:** ShadCN (Radix UI)

---

## ⚙️ Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/yourname/StartUpHQ-AI.git
cd startuphq
```

### 2. Install dependencies
```bash
npm install
# or
yarn install
```

### 3. Set up environment variables

Create a `.env.local` file and add the following:
```env
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_appwrite_project_id
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_db_id

# Collection IDs
NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID=...
NEXT_PUBLIC_APPWRITE_IDEAS_COLLECTION_ID=...
NEXT_PUBLIC_APPWRITE_CANVAS_COLLECTION_ID=...
NEXT_PUBLIC_APPWRITE_VALIDATION_COLLECTION_ID=...
NEXT_PUBLIC_APPWRITE_ROADMAP_COLLECTION_ID=...
NEXT_PUBLIC_APPWRITE_PITCH_COLLECTION_ID=...
NEXT_PUBLIC_APPWRITE_STARTUP_SNAPSHOT_COLLECTION_ID=...
```

### 4. Run the development server
```bash
npm run dev
```

Visit [https://startuphq-ai.vercel.app] to view the app.

---

## 📁 Folder Structure

- `src/app` – Main route logic (App Router)
- `src/lib` – All database operations (`db.ts`, `appwrite.ts`)
- `src/context` – User context provider
- `src/components/ui` – Reusable UI components from ShadCN
- `src/pages/(app)` – Authenticated app pages

---

🎯 Roadmap
 Authentication system (Login, Signup, Forgot Password)
 AI-powered startup idea generation
 Validation engine page
 Pitch deck builder
 Appwrite integration
 Testing setup
 Multi-language support
 Deployment guide
---

## 📄 License

MIT © 2025 StartupHQ

---

💡 Credits
Created with ❤️ by Nikhilesh Attal

📬 Contact
For questions or feedback:
📧 Email: nikhileshatal@gmail.com
🔗 LinkedIn: www.linkedin.com/in/nikhilesh-attal



> Built with 💡 by founders for founders.