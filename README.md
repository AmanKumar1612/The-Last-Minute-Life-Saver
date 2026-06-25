# The Last-Minute Life Saver

An AI-powered productivity companion that proactively helps you plan, prioritize, schedule, and complete tasks before deadlines are missed.

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, React Router, Recharts |
| Backend | FastAPI, Python 3.11+ |
| Database | MongoDB Atlas (Motor async driver) |
| AI | Google Gemini, LangChain, CrewAI |
| Auth | JWT + bcrypt |
| Notifications | Firebase Cloud Messaging |
| Calendar | Google Calendar API |
| Voice | Web Speech API |

## 📁 Project Structure

```
├── backend/          # FastAPI REST API
│   ├── app/
│   │   ├── auth/     # JWT authentication
│   │   ├── tasks/    # Task CRUD
│   │   ├── ai/       # AI modules (Gemini-powered)
│   │   ├── goals/    # Goal tracking
│   │   ├── analytics/# Productivity analytics
│   │   ├── calendar/ # Google Calendar integration
│   │   └── notifications/ # Firebase push notifications
│   └── requirements.txt
│
├── frontend/         # React + Vite SPA
│   ├── src/
│   │   ├── pages/    # Route pages
│   │   ├── components/ # Reusable UI
│   │   ├── context/  # Auth & Theme providers
│   │   ├── hooks/    # Custom React hooks
│   │   └── api/      # Axios client
│   └── package.json
```

## ⚡ Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- MongoDB Atlas account
- Google Gemini API key

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your credentials
uvicorn app.main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your API URL
npm run dev
```

## 🔑 Environment Variables

### Backend (.env)
```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
GEMINI_API_KEY=your-gemini-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FIREBASE_CREDENTIALS_PATH=./firebase-credentials.json
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:8000
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

## 🌐 Deployment

| Service | Platform |
|---------|----------|
| Frontend | Vercel |
| Backend | Render |
| Database | MongoDB Atlas |

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/signup` | Register new user |
| POST | `/auth/login` | Login & get JWT |
| GET | `/auth/me` | Get current user |
| POST | `/tasks/create` | Create task |
| GET | `/tasks/list` | List user tasks |
| PUT | `/tasks/update/{id}` | Update task |
| DELETE | `/tasks/delete/{id}` | Delete task |
| POST | `/ai/prioritize` | AI priority scoring |
| POST | `/ai/breakdown/{id}` | AI task breakdown |
| POST | `/ai/risk-analysis` | Deadline risk prediction |
| POST | `/ai/schedule` | Smart scheduler |
| POST | `/ai/rescue-plan` | Emergency rescue mode |
| POST | `/ai/coach` | Anti-procrastination coach |
| POST | `/goals/create` | Create goal |
| GET | `/goals/list` | List goals |
| GET | `/analytics` | Productivity analytics |

## 📄 License

MIT
