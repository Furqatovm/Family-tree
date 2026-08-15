# FamilyTree — Interactive Ancestry & Family Genealogy Application

A production-quality Family Tree web application for creating, visualizing, and preserving family history across generations. Built with Flask (Python REST API), PostgreSQL/SQLite, React 19, TypeScript, Tailwind CSS, React Flow, TanStack Query, and Framer Motion.

---

## Features

- 🔐 **Authentication**: User registration, login, and secure JWT authentication.
- 🌳 **Interactive Tree Canvas**: Powered by React Flow with custom Person nodes, smooth curved parent-child edges, and golden spouse marriage lines.
- 🧬 **Derived Sibling Lineage**: Siblings are automatically calculated on both backend and frontend from shared parents in the relationship graph.
- 📊 **Real API Dashboard**: Real-time statistics on total members, families, relationships, and generations.
- 📁 **Full Person & Relationship CRUD**: Add, edit, and delete family members with React Hook Form + Zod validation.
- 🔍 **Filtering & Controls**: Zoom, pan, search family members, and filter by generation depth (3 gens, 5 gens, all gens).
- 📜 **Person Profiles & Timelines**: Detailed person profile page with full biography, family network, and life events timeline.
- 🛡️ **Validation & Security**: Cycle prevention in parent-child relationships, self-relationship checks, password hashing, and clean RESTful separation.

---

## Tech Stack

### Backend
- Python 3.13 / Flask 3.1
- Flask-SQLAlchemy (ORM) + Flask-Migrate (Alembic)
- Flask-JWT-Extended (Authentication)
- Marshmallow (Request/Response schemas)
- SQLite (default local) / PostgreSQL (production ready)
- Pytest (Unit & Integration test suite)

### Frontend
- React 19 + TypeScript + Vite
- React Flow (`@xyflow/react`) for canvas visualization
- Tailwind CSS with custom design system tokens (`#FAFAF9`, `#3F6B4F`, `#A67C52`, `#D6A756`)
- TanStack Query (React Query v5) + Axios
- React Hook Form + Zod validation
- Framer Motion animations + Lucide React icons
- Dagre layout engine for automatic generational node placement

---

## Project Structure

```
Family-tree/
├── backend/
│   ├── app/
│   │   ├── models/        # SQLAlchemy Models (User, Family, Person, Relationship)
│   │   ├── schemas/       # Marshmallow Validation Schemas
│   │   ├── repositories/  # Data Access Layer
│   │   ├── services/      # Business Logic & Tree Calculations
│   │   ├── routes/        # REST Controller Blueprints
│   │   ├── extensions.py  # DB, JWT, CORS, Migrate
│   │   ├── config.py      # App Config & Environment
│   │   └── __init__.py    # App Factory
│   ├── tests/             # Pytest test suite
│   ├── seed.py            # Demo Data Seeder (4 generations)
│   ├── requirements.txt   # Python Dependencies
│   └── run.py             # Server Entry Point
│
├── frontend/
│   ├── src/
│   │   ├── api/           # Axios REST API Clients
│   │   ├── components/    # UI, Layout, React Flow Nodes & Modals
│   │   ├── context/       # Auth Provider
│   │   ├── lib/           # Axios instance & Dagre Tree Layout
│   │   ├── pages/         # Landing, Login, Register, Dashboard, Tree, Profile, Settings
│   │   ├── router/        # App Router & ProtectedRoute
│   │   ├── types/         # TypeScript Interfaces
│   │   └── index.css      # Tailwind & Custom Styles
│   ├── package.json
│   └── vite.config.ts
```

---

## Quick Start Guide

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows PowerShell)
.\venv\Scripts\Activate.ps1

# Install requirements
pip install -r requirements.txt

# Seed demo dataset (Creates demo@example.com / password123)
python seed.py

# Run Pytest test suite
pytest tests

# Start Flask server (http://127.0.0.1:5000)
python run.py
```

### 2. Frontend Setup

```bash
cd frontend

# Install npm dependencies
npm install

# Start Vite dev server (http://localhost:3000)
npm run dev
```

---

## Demo Credentials

- **Email**: `demo@example.com`
- **Password**: `password123`

The demo dataset comes pre-populated with **"The Sterling Dynasty"** tree featuring 12+ family members across 4 generations (Arthur & Margaret Sterling -> Robert & Catherine -> Eleanor & Lucas -> Clara).

---

## API Reference

### Authentication
- `POST /api/auth/register` — Register a new account
- `POST /api/auth/login` — Login and receive JWT access token
- `GET /api/auth/me` — Fetch current user profile

### Families
- `GET /api/families` — List user's family trees
- `POST /api/families` — Create a family tree
- `GET /api/families/:id` — Get family tree details
- `PUT /api/families/:id` — Update family tree name/description
- `DELETE /api/families/:id` — Delete family tree
- `GET /api/dashboard/stats` — Get real dashboard statistics

### People
- `GET /api/families/:familyId/people` — List family members
- `POST /api/families/:familyId/people` — Add family member
- `GET /api/people/:id` — Get person profile
- `PUT /api/people/:id` — Update person details
- `DELETE /api/people/:id` — Delete person

### Relationships & Tree
- `GET /api/families/:familyId/relationships` — List relationships
- `POST /api/families/:familyId/relationships` — Add relationship (`parent` or `spouse`)
- `DELETE /api/relationships/:id` — Delete relationship
- `GET /api/families/:familyId/tree` — Get React Flow formatted nodes, edges, derived siblings, and generation tiers

---

## License

MIT License. Designed & Developed for Family Genealogy & Heritage Archiving.
