# TaskMate

**A team collaboration platform built for college students to manage academic projects efficiently.**

TaskMate gives student teams a single shared workspace — tasks, files, chat, and a progress dashboard — so nothing falls through the cracks.

---

## Why TaskMate?

Most student group projects fail not because of lack of effort, but because of scattered tools. Messages in five apps, deadlines tracked in someone's head, and no one quite sure whose job it is. TaskMate fixes that.

---

## Features

| Area | What it does |
|---|---|
| **Authentication** | Register / login with JWT-secured sessions |
| **Teams** | Create a workspace, invite members via join code |
| **Tasks** | Create, assign, deadline, and track status (To Do → In Progress → Completed) |
| **Files** | Upload and share documents and code ZIPs |
| **Chat** | Real-time team messaging via WebSockets |
| **Dashboard** | Live progress bar, task counts, team overview |
| **Activity Log** | Timestamped feed of every action taken |

---

## Tech Stack

### Frontend
- **Next.js 14** (App Router) — React framework with server components
- **Tailwind CSS** — utility-first styling
- **Socket.io Client** — real-time chat
- **SWR** — data fetching and caching

### Backend
- **FastAPI** — high-performance Python API with auto-generated docs
- **SQLAlchemy** — ORM for database models
- **Alembic** — database migrations
- **python-jose** — JWT authentication
- **python-socketio** — WebSocket server

### Database
- **PostgreSQL** — primary data store

### File Storage
- **Local** (development) — files saved to `/uploads`
- **Cloudinary Free Tier** (production, optional) — cloud media storage
- **Supabase Storage Free Tier** (production, optional) — S3-compatible object store

### Deployment (all free)
- **Frontend** — Vercel or Netlify
- **Backend** — Render or Railway
- **Database** — Supabase PostgreSQL or Neon Free Tier

> **No paid APIs required.** TaskMate is built entirely on free and open-source tools.

---

## Project Structure

```
taskmate/
├── frontend/
│   ├── app/                        # Next.js App Router pages
│   │   ├── (auth)/
│   │   │   ├── login/page.jsx
│   │   │   └── register/page.jsx
│   │   ├── dashboard/page.jsx
│   │   ├── tasks/page.jsx
│   │   ├── team/page.jsx
│   │   └── chat/page.jsx
│   ├── components/
│   │   ├── ui/                     # Reusable base components
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Modal.jsx
│   │   │   └── Badge.jsx
│   │   ├── layout/
│   │   │   ├── Sidebar.jsx
│   │   │   └── Navbar.jsx
│   │   ├── dashboard/
│   │   │   ├── ProgressCard.jsx
│   │   │   ├── StatsGrid.jsx
│   │   │   └── ActivityFeed.jsx
│   │   ├── tasks/
│   │   │   ├── TaskBoard.jsx
│   │   │   ├── TaskCard.jsx
│   │   │   └── TaskModal.jsx
│   │   ├── team/
│   │   │   └── MemberCard.jsx
│   │   └── chat/
│   │       ├── ChatWindow.jsx
│   │       └── MessageBubble.jsx
│   ├── lib/
│   │   ├── api.js                  # Axios instance + request helpers
│   │   └── socket.js               # Socket.io client setup
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useTasks.js
│   │   └── useChat.js
│   ├── .env.local.example
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── routes/
│   │   │   ├── auth.py             # /api/auth — register, login, refresh
│   │   │   ├── teams.py            # /api/teams — CRUD + join code
│   │   │   ├── tasks.py            # /api/tasks — CRUD + status updates
│   │   │   ├── files.py            # /api/files — upload / download
│   │   │   └── activity.py         # /api/activity — event log
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   ├── team.py
│   │   │   ├── task.py
│   │   │   ├── file.py
│   │   │   └── activity.py
│   │   ├── schemas/
│   │   │   ├── user.py
│   │   │   ├── team.py
│   │   │   ├── task.py
│   │   │   └── file.py
│   │   ├── core/
│   │   │   ├── config.py           # Settings via pydantic-settings
│   │   │   ├── database.py         # SQLAlchemy session
│   │   │   └── security.py         # JWT helpers, password hashing
│   │   ├── services/
│   │   │   ├── auth_service.py
│   │   │   ├── task_service.py
│   │   │   └── file_service.py
│   │   ├── websockets/
│   │   │   └── chat.py             # Socket.io event handlers
│   │   └── main.py                 # App factory, router mount, CORS
│   ├── alembic/                    # Database migrations
│   ├── tests/
│   ├── .env.example
│   └── requirements.txt
│
├── .github/
│   └── workflows/
│       └── ci.yml                  # Lint + test on push
├── .gitignore
├── docker-compose.yml              # Local dev: app + postgres
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- PostgreSQL 15+ (or Docker)

---

### 1. Clone

```bash
git clone https://github.com/Shadow-Coder-888/TaskMate.git taskmate
cd taskmate
```

---

### 2. Backend Setup

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and fill in your DATABASE_URL and SECRET_KEY

# Run database migrations
alembic upgrade head

# Start the dev server
uvicorn app.main:app --reload --port 8000
```

API docs will be available at `http://localhost:8000/docs`.

---

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.local.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:8000

# Start the dev server
npm run dev
```

App will be available at `http://localhost:3000`.

---

### 4. (Optional) Run with Docker

```bash
# From the project root
docker-compose up --build
```

This spins up the backend, frontend, and a PostgreSQL container together.

---

## Environment Variables

### Backend `.env`

```env
DATABASE_URL=postgresql://user:password@localhost:5432/taskmate
SECRET_KEY=your-super-secret-key-change-this
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Optional file storage (leave blank to use local disk)
CLOUDINARY_URL=
SUPABASE_URL=
SUPABASE_KEY=
```

### Frontend `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SOCKET_URL=http://localhost:8000
```

---

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Create a new account |
| `POST` | `/api/auth/login` | Login and receive JWT |
| `GET` | `/api/teams/` | List user's teams |
| `POST` | `/api/teams/` | Create a team |
| `POST` | `/api/teams/join` | Join via code |
| `GET` | `/api/tasks/` | List tasks for a team |
| `POST` | `/api/tasks/` | Create a task |
| `PATCH` | `/api/tasks/{id}` | Update task status |
| `DELETE` | `/api/tasks/{id}` | Delete a task |
| `POST` | `/api/files/upload` | Upload a file |
| `GET` | `/api/files/` | List team files |
| `GET` | `/api/activity/` | Get activity log |
| `WS` | `/ws/chat/{team_id}` | WebSocket chat connection |

Full interactive docs at `/docs` when the backend is running.

---

## Deployment

### Frontend → Vercel

1. Push to GitHub.
2. Import the repo on [vercel.com](https://vercel.com).
3. Set root directory to `frontend`.
4. Add your environment variables.
5. Deploy.

### Backend → Render

1. Create a new **Web Service** on [render.com](https://render.com).
2. Set root directory to `backend`.
3. Build command: `pip install -r requirements.txt && alembic upgrade head`
4. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables.

### Database → Neon or Supabase

Both offer a free PostgreSQL tier. Create a project, copy the connection string, and paste it into `DATABASE_URL`.

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push: `git push origin feat/your-feature`
5. Open a pull request

Please keep commits small and focused. See [CONTRIBUTING.md](CONTRIBUTING.md) for code style guidelines.

---

## License

MIT — see [LICENSE](LICENSE) for details.
