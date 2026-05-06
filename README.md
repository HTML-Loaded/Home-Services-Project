# Databases Project (Django + React)

Monorepo for a Django REST API (MySQL) and a React frontend for local development.

## Prereqs

- Python + pip
- Node.js + npm
- MySQL running locally

## Repo layout

- `backend/` — Django + DRF API
- `frontend/` — React app

## Backend (Django)

### 1) Create + activate venv

PowerShell:

```powershell
cd "Databases Project\backend"
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

CMD:

```bat
cd /d "Databases Project\backend"
python -m venv .venv
.\.venv\Scripts\activate.bat
```

### 2) Install dependencies

```bash
pip install -r requirements.txt
```

### 3) Configure environment

Copy:

- `backend/.env.example` → `backend/.env`

Update the MySQL values to your local MySQL values:

- `MYSQL_DATABASE`
- `MYSQL_USER`
- `MYSQL_PASSWORD`

Also ensure your React dev server origin is listed in:

- `CORS_ALLOWED_ORIGINS` (usually `http://localhost:3000` for Create React App)

### 4) Migrate + seed categories

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py seed_categories
```

### 5) Run API

```bash
python manage.py runserver
```

API base URL:

- `http://127.0.0.1:8000/api/`

## Frontend (React)

If `frontend/` is empty, create a default app:

```bash
cd "Databases Project"
npx create-react-app frontend
```

Run it:

```bash
cd frontend
npm start
```

The default dev URL is:

- `http://localhost:3000`

## API endpoints (current)

- `POST /api/auth/register/`
- `POST /api/auth/login/` (returns JWT `access` + `refresh`)
- `POST /api/providers/become/`
- `PUT /api/providers/categories/`
- `POST /api/jobs/`
- `GET /api/jobs/list/?category_id=...&service_area=...`
- `POST /api/jobs/<job_id>/book/`
- `POST /api/bookings/select/`
- `POST /api/bookings/cancel/`
- `POST /api/bookings/complete/`
- `POST /api/bookings/pay/`
- `POST /api/bookings/review/`

## Notes

- Do not commit `backend/.env` (use `.env.example` as a template).
- Categories must exist before creating job postings and provider categories (run `seed_categories`).
