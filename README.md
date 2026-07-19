# 🎓 EduReach AI

### **An Offline-First AI Learning Companion for Rural Students**

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=FFD62B)](https://vitejs.dev/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white)](https://getbootstrap.com/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-8E75C2?style=for-the-badge&logo=googlegemini&logoColor=white)](https://ai.google.dev/)

---

## 📌 Table of Contents
- [📖 Introduction](#-introduction)
- [⚠️ Problem Statement](#-problem-statement)
- [💡 Solution](#-solution)
- [🚀 Features](#-features)
- [🛠 Tech Stack](#-tech-stack)
- [📂 Project Structure](#-project-structure)
- [⚙️ Environment Variables](#-environment-variables)
- [💻 Installation](#-installation)
- [🎮 Usage](#-usage)
- [📸 Screenshots](#-screenshots)
- [🎥 Demo Video](#-demo-video)
- [🌐 Live Demo](#-live-demo)
- [📝 API Documentation](#-api-documentation)
- [🔮 Future Scope](#-future-scope)
- [👥 Contributors](#-contributors)
- [📄 License](#-license)
- [🙏 Acknowledgements](#-acknowledgements)

---

## 📖 Introduction
**EduReach AI** is an innovative educational platform built specifically for students in low-connectivity, remote, or rural village environments. Leveraging Google's high-performance Gemini AI model, EduReach AI translates learning questions, uploads homework photographs, generates customized quizzes, and detects weak topics—completely adapting to the native regional languages of Indian students (including Hindi and Telugu).

Most importantly, the platform is designed with an **offline-first local caching system** that runs seamlessly on low-cost devices. It caches learning resources locally and queues student performance records, syncing them to remote database endpoints once connectivity is restored.

---

## ⚠️ Problem Statement
Educational technologies are predominantly designed for urban centers with persistent high-speed broadband connections. For rural classrooms, village study groups, and remote schools, the reality is stark:
- **Unreliable Connectivity:** Frequent electrical grids fail, cellular blackouts happen, and internet routes drop unexpectedly.
- **Language Barriers:** First-generation students are taught in localized regional languages (like Telugu or Hindi) and struggle with English-only digital interfaces.
- **Lack of Personalization:** Individual student attention is scarce, leading to undetected learning gaps and repetitive errors on core concepts.

---

## 💡 Solution
EduReach AI provides an equitable learning bridge by offering:
1. **Offline-First Resilience:** Students can save custom AI-compiled lessons, worksheets, and scorecards directly to their browser's Local Storage, keeping them fully accessible during connection drops.
2. **Local Sync Queues:** Action history, settings preferences, and weak-topic progress updates are tracked locally and synchronized asynchronously when a network connection is detected.
3. **Multilingual Gemini Integration:** Real-time translation and content processing in Hindi, Telugu, and English.
4. **Adaptive Practice:** Instant revision pathways built around localized student data.

---

## 🚀 Features

### 🏠 Home Dashboard
- Real-time connection indicator (🟢 Online Mode / 🔴 Offline Mode).
- Greeting banner dynamically adapted to Signed-In or Guest profiles.
- Activity logs history showing recently saved items, quiz sessions, and setting updates.

### 🤖 AI Tutor
- Grade-based learning (Classes 4 to 10) and comprehensive subjects (Maths, Science, History, Geography, and languages).
- Quick explanation prompts tailored to the student's selected grade level.
- **Explain Again** feature providing secondary analogies and simpler wording for complex concepts.
- **Manual Save Lesson** buttons to store study notes.

### 📷 Image-Based Doubt Solver
- Drag-and-drop or select workbook screenshots or handwritten homework questions.
- Google Gemini OCR scans and extracts questions instantly.
- Formulates breakdown explanations, bulleted summaries, and real-life analogies.
- **Save Explanation** stores text and image data offline.

### 📝 Adaptive Quiz Generator
- Generates Multiple Choice Question tests based on specific student-entered topics.
- Scores results instantly and displays color-coded correction cards (Correct/Incorrect) with guided descriptions.
- Manual **Save Quiz Result** logs scores for revision.

### 📊 Weak Topic Detection
- Tracks cumulative quiz performance patterns locally.
- Automatically flags high-error subjects and low-confidence categories.
- Features quick-click links to launch AI tutor sessions targeting weak areas directly.

### 📚 Offline Learning
- Unified library listing Saved Lessons, Saved Image Explanations, and Saved Quiz Results.
- Study modal interfaces to review cached materials or inspect score cards.
- Full deletion utilities to clear memory storage.

### ⚙️ Settings
- Personalization panel for language preferences (Telugu, Hindi, English).
- Default class grades and subject hooks.
- Interface theme toggler supporting dynamic Light / Dark modes.

---

## 🛠 Tech Stack

| Layer | Technology | Details |
|---|---|---|
| **Frontend** | React, Vite | Modular UI components and fast HMR bundling |
| **Styling** | Bootstrap CSS, Custom HSL | Responsive dashboards and modern animations |
| **Backend** | Python, FastAPI | High-performance asynchronous endpoint handlers |
| **Core AI Engine** | Google Gemini API (1.5 Flash) | Context-aware translations, OCR, and quiz generation |
| **Storage** | Browser Local Storage | Persistent client-side caching for offline availability |
| **API Client** | Axios | Configured base proxy endpoints and form-data uploads |

---

## 📂 Project Structure

```
EduReach-AI/
├── frontend/                   # React + Vite Client Application
│   ├── src/
│   │   ├── components/         # Shared UI components (Sidebar.jsx)
│   │   ├── pages/              # Standalone feature pages
│   │   │   ├── AITutor/
│   │   │   ├── Dashboard/
│   │   │   ├── ImageDoubtSolver/
│   │   │   ├── Landing/
│   │   │   ├── OfflineLearning/
│   │   │   ├── QuizGenerator/
│   │   │   ├── Settings/
│   │   │   └── WeakTopics/
│   │   ├── services/           # Reusable API handlers and offline database utilities
│   │   │   ├── api.js          # Global Axios interceptor config
│   │   │   ├── offlineService.js
│   │   │   ├── settingsService.js
│   │   │   └── translationService.js
│   │   ├── App.jsx             # Client Routing setup
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
└── backend/                    # Python + FastAPI Server Application
    ├── app/
    │   ├── api/                # API Endpoints (tutor, quiz, image endpoints)
    │   ├── models/             # Pydantic Schemas / validation structures
    │   ├── services/           # Gemini API logic, prompt templates, OCR processing
    │   └── main.py             # FastAPI App initializers and Middleware CORS Setup
    ├── requirements.txt
    └── .env.example
```

---

## ⚙️ Environment Variables

### Frontend Setup (`frontend/.env`)
Create a file named `.env` inside the `frontend` folder:
```env
VITE_API_URL=http://localhost:8000
```

### Backend Setup (`backend/.env`)
Create a file named `.env` inside the `backend` folder:
```env
GEMINI_API_KEY=YOUR_GOOGLE_GEMINI_API_KEY_HERE
```

---

## 💻 Installation

### 1. Backend Server Setup
Navigate to the backend directory, initialize a python virtual environment, install dependencies, and start the development server:
```bash
cd backend
python -m venv venv
# Activate on Windows:
venv\Scripts\activate
# Activate on macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload
```

The backend API will run at `http://127.0.0.1:8000`.

### 2. Frontend Setup
Open a new terminal session, navigate to the frontend directory, install dependencies, and start the client dev server:
```bash
cd frontend
npm install
npm run dev
```

Open your browser to `http://localhost:5173`.

---

## 🎮 Usage
1. Open the landing screen and type in your name or click **Continue as Guest**.
2. Customize your grade level (e.g. Class 6) and primary subject (e.g. Science) in the dashboard toolbar.
3. Access the **AI Tutor** to ask questions in Hindi or Telugu. Save explanations offline by clicking **Save Lesson**.
4. Capture or upload a worksheet scan in the **Image Doubt Solver** to extract handwritten math/science queries. Click **Save Explanation**.
5. Practice by launching customized tests on any topic using the **Quiz Generator**. Select your answers, submit the quiz, and click **Save Quiz Result**.
6. Navigate to the **Offline Learning** tab to study and review all saved resources without requiring an active network connection.
7. Change theme options or delete offline cache anytime under the **Settings** view.

---

## 📸 Screenshots
*Placeholders for user-provided screenshots:*

| Landing / Sign-In Screen | Main Study Dashboard |
|:---:|:---:|
| `[Screenshot Placeholder: Landing Page]` | `[Screenshot Placeholder: Dashboard Page]` |

| AI Tutor Multilingual Output | Image Doubt Solver |
|:---:|:---:|
| `[Screenshot Placeholder: AI Tutor]` | `[Screenshot Placeholder: Image Doubt Solver]` |

| Weak Topics Performance Tracker | Offline Saved Library |
|:---:|:---:|
| `[Screenshot Placeholder: Weak Topics]` | `[Screenshot Placeholder: Offline Library]` |

---

## 🎥 Demo Video
*Placeholder for project demo recording:*
👉 **[Watch the EduReach AI Hackathon Demo Video](https://youtube.com/)**

---

## 🌐 Live Demo
- Frontend Application: **[edureach-ai.vercel.app](https://vercel.com)**
- Backend Server: **[edureach-ai-backend.onrender.com](https://render.com)**

---

## 📝 API Documentation
FastAPI automatically serves interactive API documents. To inspect them, ensure the backend is running and open:
- Swagger UI Docs: `http://127.0.0.1:8000/docs`
- Redoc Documentation: `http://127.0.0.1:8000/redoc`

---

## 🔮 Future Scope
- **Voice-Based Learning:** Adding speech-to-text queries in native dialects to assist younger/pre-literate students.
- **OCR Enhancements:** Improving handwritten handwriting extraction for vernacular mathematical scripts.
- **Secure Authentication:** Migrating guest profiles to secure cloud-synchronized learner databases.
- **Teacher/Parent Portal:** Providing classroom dashboard systems where teachers can track student sync-caches and evaluate weak topics.
- **Local On-Device AI Models:** Running lightweight open-source models (like Gemma or Llama) directly on school hardware without requiring the Gemini cloud endpoint.

---

## 👥 Contributors
- **Student Team Hackathon Group** (e.g., Jane Doe, John Doe)

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgements
- Google Gemini Developer Competition Team.
- FastAPI and Starlette framework authors.
- Rural schools and communities that inspired the offline-first specifications.
