# Personal Expense Analyzer

A full-stack personal finance application for recording expenses and income, managing budgets, organizing categories, tracking recurring transactions, and understanding spending patterns through analytics.

## Developer

**Plabon Krishna Banik**

## Project Motive

The goal of Personal Expense Analyzer is to make everyday money management simple, structured, and measurable. Instead of keeping financial records in scattered notes or spreadsheets, users can keep their transactions in one secure application and use the resulting data to make better financial decisions.

The project focuses on:

- Maintaining a clear history of income and expenses
- Understanding where money is being spent
- Setting and monitoring budgets
- Tracking recurring financial commitments
- Comparing monthly financial activity
- Providing a practical foundation for future personal finance features

## Main Features

- User registration and JWT-based login
- Secure password hashing
- Expense creation, editing, filtering, and deletion
- Income management
- Custom expense categories
- Budget creation and monitoring
- Recurring income and expense records
- Dashboard with financial summaries
- Analytics with monthly totals, category breakdowns, and comparisons
- Responsive React frontend
- REST API with automatic OpenAPI documentation
- PostgreSQL database support
- Alembic database migrations

## Technology Stack

### Frontend

- React 19
- TypeScript
- Vite
- React Router
- Tailwind CSS
- Recharts
- Vitest and Testing Library

### Backend

- Python
- FastAPI
- SQLAlchemy
- Pydantic Settings
- PostgreSQL
- Alembic
- JWT authentication
- Argon2 password hashing

## Project Structure

```text
personal-expense-analyzer/
├── backend/
│   ├── app/
│   │   ├── api/           # HTTP routes and API versioning
│   │   ├── core/          # Settings, security, and dependencies
│   │   ├── db/            # Database engine and session setup
│   │   ├── models/        # SQLAlchemy database models
│   │   ├── repositories/  # Database access and CRUD operations
│   │   ├── schemas/       # Request and response validation
│   │   ├── services/      # Business logic
│   │   └── utils/         # Reusable validation helpers
│   ├── alembic/           # Database migration history
│   ├── .env.example       # Safe environment variable template
│   ├── requirements.txt
│   └── run.py
├── frontend/
│   ├── src/
│   │   ├── app/           # Application shell
│   │   ├── components/    # Shared UI components
│   │   ├── hooks/         # React hooks
│   │   ├── pages/         # Application pages
│   │   ├── services/      # API client
│   │   └── types/         # TypeScript types
│   ├── .env.example       # Frontend API URL template
│   └── package.json
├── .gitignore
└── README.md
```

## Application Flow

```text
React Frontend
      |
      v
FastAPI REST API
      |
      v
Services and Business Logic
      |
      v
Repositories and SQLAlchemy Models
      |
      v
PostgreSQL Database
```

## Requirements

Install the following before running the project:

- Python 3.11 or newer
- Node.js 20 or newer
- npm
- PostgreSQL 16 or Docker Desktop with Docker Compose

## Backend Setup

Open PowerShell in the `backend` directory:

```powershell
cd backend
```

Create a local virtual environment if desired. It is ignored by Git and should not be uploaded:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

Install Python dependencies:

```powershell
pip install -r requirements.txt
```

Create the local environment file from the template:

```powershell
Copy-Item .env.example .env
```

Update `.env` with the local PostgreSQL connection string and a strong `SECRET_KEY`.

Run database migrations:

```powershell
alembic upgrade head
```

Start the backend:

```powershell
python run.py
```

The backend will be available at:

- API: http://localhost:8000
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Database with Docker Compose

From the `backend` directory, Docker can start PostgreSQL and the API together:

```powershell
docker compose up --build
```

The Docker setup exposes PostgreSQL on port `5432` and the API on port `8000`.

## Frontend Setup

Open another terminal in the `frontend` directory:

```powershell
cd frontend
npm install
```

The frontend uses this default API URL:

```text
http://localhost:8000/api/v1
```

To use a custom API URL, create a local `.env` file from `.env.example` and set:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

Start the frontend:

```powershell
npm run dev
```

The application will be available at:

```text
http://localhost:5173
```

## Useful Commands

### Frontend

```powershell
npm run dev       # Start development server
npm run build     # Type-check and create production build
npm run preview   # Preview production build
npm run test      # Run tests once
npm run typecheck # Run TypeScript checks
```

### Backend

```powershell
python run.py                 # Start the API server
alembic upgrade head          # Apply pending migrations
alembic current               # Show current migration
alembic history               # Show migration history
```

## API Modules

All version 1 endpoints use the `/api/v1` prefix.

- `/auth`: registration and login
- `/users`: user profile operations
- `/expenses`: expense records
- `/income`: income records
- `/categories`: transaction categories
- `/budgets`: budget management
- `/recurring-transactions`: recurring financial records
- `/analytics`: summaries and financial reports

The complete interactive API reference is available at `/docs` when the backend is running.

## Environment and Security

Never upload local `.env` files, database credentials, or production secret keys. Only the `.env.example` templates belong in the repository. Use a strong, unique `SECRET_KEY` outside development.

The repository ignores virtual environments, `node_modules`, Python cache files, build output, logs, local databases, and archive files through `.gitignore`.

## License

This project is intended for educational and personal finance management use. Add a project-specific license before public distribution if required.
