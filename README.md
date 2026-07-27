<div align="center">

<!-- Logo Placeholder -->
<!-- <img src="docs/images/logo.png" alt="Nexus-ESS Logo" width="120" /> -->

# 🏢 Nexus-ESS

### Enterprise Employee Self-Service Platform

---

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6.svg)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748.svg)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1.svg)](https://www.postgresql.org/)
[![Express](https://img.shields.io/badge/Express-5-000000.svg)](https://expressjs.com/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF.svg)](https://vitejs.dev/)

---

**Nexus-ESS** is a full-featured, enterprise-grade Employee Self-Service web application designed to streamline HR operations, attendance tracking, leave management, payroll processing, and employee profile management — all through a modern, responsive interface.

[🚀 Quick Start](#-installation) • [📖 Documentation](#-api-overview) • [🤝 Contributing](#-contributing)

---

</div>

## 📑 Table of Contents

- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [🏗️ Architecture](#️-architecture)
- [📁 Project Structure](#-project-structure)
- [⚡ Installation](#-installation)
- [🔐 Environment Variables](#-environment-variables)
- [▶️ Running the Project](#️-running-the-project)
- [🗄️ Database](#️-database)
- [🔌 API Overview](#-api-overview)
- [🛡️ Input Validation](#️-input-validation)
- [📜 Scripts](#-scripts)
- [📸 Screenshots](#-screenshots)
- [🚀 Deployment](#-deployment)
- [🔒 Security](#-security)
- [🗺️ Future Enhancements](#️-future-enhancements)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [👨‍💻 Author](#-author)
- [💬 Support](#-support)

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 📊 Employee Dashboard
- Personalized overview with key metrics
- Attendance summary and trends
- Leave balance tracking
- Recent activity feed

### 👥 Employee Management
- Comprehensive employee profiles
- Department & position hierarchy
- Employment lifecycle tracking
- Profile change request workflow

### ⏰ Attendance Management
- Real-time check-in / check-out
- Shift scheduling & assignments
- Attendance incident tracking
- Geolocation-enabled attendance
- Add & manage biometric attendance devices
- Device enrollment and configuration

### 📅 Leave Management
- Multiple leave type support
- Leave balance tracking
- Multi-step approval workflow
- Carry-forward policy engine
- Holiday calendar

</td>
<td width="50%">

### 💰 Payroll Processing
- Configurable salary components
- Automated payslip generation
- Payroll period management
- Disbursement tracking
- Tax & deduction calculations

### 🔐 Authentication & Authorization
- JWT-based authentication
- Refresh token rotation
- Role-Based Access Control (RBAC)
- Granular permission system
- Account lockout protection

### 🔔 Notifications
- Real-time notification system
- Event-driven notifications
- Read/unread status tracking

### 📄 Document Management
- Employee document storage
- Categorized document library
- Confidential document support
- File upload with validation

### 📈 Performance Reviews
- Review cycle management
- Goal tracking
- Rating system
- Reviewer assignment

</td>
</tr>
</table>

> **And more:** Audit logging, system settings, applicant pre-employment pipeline, responsive UI with light/dark theme, full Arabic language support with RTL (Right-to-Left) layout, attendance device management, internationalization (i18n), and comprehensive error handling.

---

## 🛠️ Tech Stack

| Layer | Technology | Version |
|:------|:-----------|:--------|
| **Frontend** | React | 19.x |
| **Language** | TypeScript | 5.8 |
| **Build Tool** | Vite | 6.x |
| **Styling** | Tailwind CSS | 4.x |
| **State Management** | Zustand | 5.x |
| **Server State** | TanStack React Query | 5.x |
| **Form Handling** | React Hook Form + Zod | Latest |
| **Animations** | Motion (Framer Motion) | 12.x |
| **Charts** | Recharts | 3.x |
| **Backend** | Node.js + Express | 5.x |
| **Database** | PostgreSQL | 16.x |
| **ORM** | Prisma | 7.x |
| **Authentication** | JSON Web Tokens | 9.x |
| **Password Hashing** | bcrypt | 6.x |
| **Logging** | Winston | 3.x |
| **Caching** | Redis (ioredis) | 5.x |
| **API Docs** | Swagger (OpenAPI) | Latest |
| **Testing** | Vitest + Supertest | 4.x |
| **Linting** | ESLint + Prettier | Latest |
| **Pre-commit** | Husky + lint-staged | Latest |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                         │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              React + TypeScript + Vite                     │  │
│  │  ┌─────────┐  ┌──────────┐  ┌────────┐  ┌─────────────┐  │  │
│  │  │ Zustand │  │ React    │  │ Router │  │  Recharts  │  │  │
│  │  │  Store  │  │  Query   │  │  DOM   │  │  Components │  │  │
│  │  └─────────┘  └──────────┘  └────────┘  └─────────────┘  │  │
│  └───────────────────────────┬───────────────────────────────┘  │
└──────────────────────────────┼──────────────────────────────────┘
                               │ HTTP / HTTPS
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                     SERVER (Express.js)                          │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │                     Middleware Layer                       │    │
│  │  ┌─────┐ ┌───────┐ ┌──────┐ ┌─────┐ ┌────────┐ ┌──────┐ │    │
│  │  │ CORS│ │Helmet │ │Rate  │ │Auth │ │Valid.  │ │Morgan│ │    │
│  │  │     │ │       │ │Limit │ │(JWT)│ │ (Zod)  │ │      │ │    │
│  │  └─────┘ └───────┘ └──────┘ └─────┘ └────────┘ └──────┘ │    │
│  └──────────────────────────┬───────────────────────────────┘    │
│                             │                                    │
│  ┌──────────────────────────▼───────────────────────────────┐    │
│  │                   Route Handlers                          │    │
│  │  ┌──────┐ ┌──────────┐ ┌────────┐ ┌──────┐ ┌────────┐  │    │
│  │  │ Auth │ │Employees │ │Attend. │ │Leave │ │Payroll │  │    │
│  │  └──────┘ └──────────┘ └────────┘ └──────┘ └────────┘  │    │
│  └──────────────────────────┬───────────────────────────────┘    │
│                             │                                    │
│  ┌──────────────────────────▼───────────────────────────────┐    │
│  │                   Service Layer                           │    │
│  └──────────────────────────┬───────────────────────────────┘    │
│                             │                                    │
│  ┌──────────────────────────▼───────────────────────────────┐    │
│  │                   Prisma ORM                              │    │
│  └──────────────────────────┬───────────────────────────────┘    │
└─────────────────────────────┼────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                      PostgreSQL Database                         │
│  ┌──────────┐ ┌──────────┐ ┌────────┐ ┌────────┐ ┌──────────┐  │
│  │  Users   │ │Employees │ │Attend. │ │Leave   │ │ Payroll  │  │
│  │  Roles   │ │Depts.    │ │Shifts  │ │Types   │ │ Periods  │  │
│  │  Perms.  │ │Positions │ │Devices │ │Balances│ │ Disburs. │  │
│  └──────────┘ └──────────┘ └────────┘ └────────┘ └──────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

- **🔒 Security-First Design** — JWT authentication with refresh token rotation, bcrypt password hashing, rate limiting, and Helmet security headers.
- **🧩 Modular Backend** — Domain-driven module structure where each feature (auth, employees, attendance, etc.) is self-contained with its own controller, service, routes, and validation schema.
- **⚡ Optimized Frontend** — React Query for server-state caching, Zustand for client-state, Vite for lightning-fast HMR.
- **📊 Type-Safe Throughout** — TypeScript on the frontend, Zod validation on both ends, Prisma for type-safe database queries.
- **🌍 Internationalization** — Built-in i18n support with Arabic language, RTL (Right-to-Left) layout, and language switching.

---

## 📁 Project Structure

```
nexus-ess/
│
├── frontend/                          # React Frontend Application
│   ├── public/                        # Static assets
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/                # UI Components
│   │   │   ├── admin-dashboard/       # Admin dashboard views
│   │   │   ├── employee-dashboard/    # Employee dashboard views
│   │   │   ├── hr/                    # HR-specific components
│   │   │   ├── AdminDashboard.tsx     # Admin dashboard container
│   │   │   ├── EmployeeDashboard.tsx  # Employee dashboard container
│   │   │   ├── HRDashboard.tsx        # HR dashboard container
│   │   │   ├── Auth.tsx               # Authentication component
│   │   │   ├── OnboardingWizard.tsx   # Employee onboarding flow
│   │   │   ├── ErrorBoundary.tsx      # Error boundary wrapper
│   │   │   ├── ThemeToggle.tsx        # Dark/light mode toggle
│   │   │   ├── LanguageSwitcher.tsx   # i18n language selector
│   │   │   └── ToastContainer.tsx     # Toast notification system
│   │   ├── context/                   # React Context providers
│   │   ├── hooks/                     # Custom React hooks
│   │   ├── i18n/                      # Internationalization config
│   │   ├── lib/                       # API client & utilities
│   │   │   ├── utils.ts              # Shared utility functions
│   │   │   ├── users.ts              # User API functions
│   │   │   ├── shifts.ts             # Shift API functions
│   │   │   ├── payroll.ts            # Payroll API functions
│   │   │   └── ...                   # Other API modules
│   │   ├── stores/                    # Zustand state stores
│   │   │   ├── authStore.ts          # Authentication state
│   │   │   ├── notificationStore.ts  # Notification state
│   │   │   └── themeStore.ts         # Theme preferences
│   │   ├── test/                      # Test files
│   │   ├── types/                     # TypeScript type definitions
│   │   │   ├── employee.ts
│   │   │   ├── attendance.ts
│   │   │   ├── leave.ts
│   │   │   ├── payroll.ts
│   │   │   └── ...
│   │   ├── App.tsx                    # Root application component
│   │   ├── main.tsx                   # Application entry point
│   │   └── index.css                  # Global styles
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── backend/                           # Express Backend Application
│   ├── prisma/
│   │   ├── schema.prisma              # Database schema definition
│   │   ├── seed.js                    # Database seed script
│   │   └── migrations/                # Database migrations
│   ├── src/
│   │   ├── config/                    # Application configuration
│   │   ├── core/                      # Core utilities & middleware
│   │   ├── modules/                   # Feature modules (domain-driven)
│   │   │   ├── auth/                  # Authentication
│   │   │   ├── users/                 # User management
│   │   │   ├── employees/             # Employee management
│   │   │   ├── departments/           # Department management
│   │   │   ├── positions/             # Position management
│   │   │   ├── roles/                 # Role management
│   │   │   ├── permissions/           # Permission management
│   │   │   ├── attendance-records/    # Attendance tracking
│   │   │   ├── attendance-devices/    # Device integration
│   │   │   ├── attendance-incidents/  # Incident management
│   │   │   ├── shifts/                # Shift management
│   │   │   ├── shift-assignments/     # Shift assignments
│   │   │   ├── leave-types/           # Leave type config
│   │   │   ├── leave-requests/        # Leave requests
│   │   │   ├── leave-balances/        # Leave balances
│   │   │   ├── holidays/              # Holiday management
│   │   │   ├── payroll/               # Payroll processing
│   │   │   ├── payroll-periods/       # Payroll periods
│   │   │   ├── payroll-disbursements/ # Disbursements
│   │   │   ├── salary-components/     # Salary components
│   │   │   ├── payslip-items/         # Payslip items
│   │   │   ├── employee-salary-profiles/ # Salary profiles
│   │   │   ├── employee-bank-accounts/   # Bank accounts
│   │   │   ├── documents/             # Document management
│   │   │   ├── document-categories/   # Document categories
│   │   │   ├── performance-reviews/   # Performance reviews
│   │   │   ├── notifications/         # Notification system
│   │   │   ├── profile-change-requests/ # Profile changes
│   │   │   ├── applicants/            # Applicant pipeline
│   │   │   ├── audit-logs/            # Audit logging
│   │   │   ├── dashboard/             # Dashboard data
│   │   │   └── settings/              # System settings
│   │   ├── app.js                     # Express app setup
│   │   └── server.js                  # Server entry point
│   ├── tests/                         # Backend test suites
│   ├── package.json
│   ├── .env                           # Environment variables
│   ├── .prettierrc                    # Prettier config
│   └── eslint.config.mjs             # ESLint config
│
├── .gitignore
└── README.md                          # This file
```

---

## ⚡ Installation

### Prerequisites

Make sure you have the following installed on your machine:

| Requirement | Minimum Version | Check Command |
|:------------|:----------------|:--------------|
| **Node.js** | 18+ | `node --version` |
| **npm** | 9+ | `npm --version` |
| **PostgreSQL** | 14+ | `psql --version` |
| **Git** | 2.x | `git --version` |

### 1. Clone the Repository

```bash
git clone https://github.com/AnasHaidar-95/nexus-ess.git
cd nexus-ess
```

### 2. Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Configure Environment Variables

```bash
# Create your .env file in the backend directory
cd ../backend
cp .env.example .env   # or create manually
```

> ⚠️ **Important:** Never commit your `.env` file to version control. See [Environment Variables](#-environment-variables) below for required configuration.

### 4. Set Up the Database

```bash
# Ensure PostgreSQL is running, then create a database
psql -U postgres -c "CREATE DATABASE ess_db;"
```

### 5. Run Prisma Migrations

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev
```

### 6. Seed the Database (Optional)

```bash
npm run prisma:seed
```

### 7. Start Development Servers

```bash
# Terminal 1 — Backend (port 3000)
cd backend
npm run dev

# Terminal 2 — Frontend (port 5173)
cd frontend
npm run dev
```

Visit **http://localhost:5173** 🎉

---

## 🔐 Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

| Variable | Description | Default | Required |
|:---------|:------------|:--------|:--------:|
| `DATABASE_URL` | PostgreSQL connection string | — | ✅ |
| `PORT` | Server port number | `3000` | ❌ |
| `NODE_ENV` | Environment mode (`development` / `production`) | `development` | ✅ |
| `JWT_SECRET` | Secret key for JWT access tokens | — | ✅ |
| `JWT_REFRESH_SECRET` | Secret key for JWT refresh tokens | — | ✅ |
| `JWT_EXPIRES_IN` | Access token expiration time | `15m` | ❌ |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiration time | `7d` | ❌ |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` | ❌ |
| `REDIS_HOST` | Redis server host | `localhost` | ❌ |
| `REDIS_PORT` | Redis server port | `6379` | ❌ |
| `REDIS_PASSWORD` | Redis authentication password | — | ❌ |
| `REDIS_DB` | Redis database number | `0` | ❌ |

> 💡 **Note:** Redis is optional. The application falls back to an in-memory cache if Redis is unavailable.

### Example `.env` File

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/ess_db?schema=public"
NODE_ENV=development
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

---

## ▶️ Running the Project

### Frontend Development Server

```bash
cd frontend
npm run dev
```

> 🌐 Starts at **http://localhost:5173** with hot module replacement (HMR).

### Backend Development Server

```bash
cd backend
npm run dev
```

> 🚀 Starts at **http://localhost:3000** with auto-restart via Nodemon.

### Development Mode

Both servers support hot reloading for a seamless development experience. The frontend proxies `/api` requests to the backend.

### Production Build

```bash
# Build frontend
cd frontend
npm run build

# Preview production build
npm run preview

# Start backend in production
cd ../backend
NODE_ENV=production npm start
```

---

## 🗄️ Database

### Overview

Nexus-ESS uses **PostgreSQL** as its primary database, managed through **Prisma ORM** for type-safe, declarative data access.

### Schema Highlights

The database is organized into the following domains:

| Domain | Tables | Description |
|:-------|:-------|:------------|
| **Security** | `users`, `roles`, `permissions`, `role_permissions`, `refresh_tokens` | Authentication & authorization |
| **Organization** | `departments`, `positions`, `employees`, `profile_change_requests` | Org structure & employee data |
| **Attendance** | `shifts`, `employee_shift_assignments`, `attendance_devices`, `attendance_records`, `attendance_incidents` | Time & attendance tracking |
| **Leave** | `leave_types`, `leave_balances`, `leave_requests`, `leave_approval_steps`, `holidays` | Leave management |
| **Payroll** | `salary_components`, `payroll_periods`, `payroll_disbursements`, `payslip_items`, `employee_salary_profiles`, `employee_bank_accounts` | Payroll processing |
| **Documents** | `document_categories`, `employee_documents`, `applicant_documents` | Document management |
| **Performance** | `performance_reviews` | Performance tracking |
| **Notifications** | `notifications` | Alert system |
| **Administration** | `system_settings`, `audit_logs`, `applicant_profiles` | System config & auditing |

### Database Commands

```bash
# Generate Prisma client (after schema changes)
npx prisma generate

# Run development migrations
npx prisma migrate dev

# Push schema without creating migration
npx prisma db push

# Open Prisma Studio (visual database browser)
npx prisma studio

# Reset database and re-seed
npx prisma migrate reset
npm run prisma:seed
```

> 💡 **Tip:** Run `npx prisma format` to format your `schema.prisma` file.

---

## 🔌 API Overview

The backend exposes a versioned RESTful API organized by domain modules. All endpoints are prefixed with `/api/v1`.

### 🔍 Interactive API Documentation

| Resource | URL | Description |
|:---------|:----|:------------|
| **Swagger UI** | `http://localhost:3000/api-docs` | Interactive API explorer with try-it-out support |
| **OpenAPI JSON** | `http://localhost:3000/api-docs.json` | Raw OpenAPI 3.0 spec (import into Postman, Insomnia, etc.) |

> The Swagger documentation includes **request body schemas**, **response examples**, **JWT authentication** (bearer token), and **input validation** rules derived from Zod schemas.

### Authentication

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `POST` | `/api/v1/auth/register` | Register a new user |
| `POST` | `/api/v1/auth/login` | Authenticate user |
| `POST` | `/api/v1/auth/refresh` | Refresh access token |
| `POST` | `/api/v1/auth/logout` | Invalidate session |
| `POST` | `/api/v1/auth/forgot-password` | Request password reset |
| `POST` | `/api/v1/auth/reset-password` | Reset password with token |

### Employees

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `GET` | `/api/v1/employees` | List all employees |
| `GET` | `/api/v1/employees/:id` | Get employee by ID |
| `POST` | `/api/v1/employees` | Create new employee |
| `PUT` | `/api/v1/employees/:id` | Update employee |
| `DELETE` | `/api/v1/employees/:id` | Soft delete employee |

### Attendance

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `GET` | `/api/v1/attendance-records` | List attendance records |
| `POST` | `/api/v1/attendance-records/check-in` | Check in |
| `POST` | `/api/v1/attendance-records/check-out` | Check out |
| `PUT` | `/api/v1/attendance-records/:id` | Update attendance record |

### Leave Management

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `GET` | `/api/v1/leave-requests` | List leave requests |
| `POST` | `/api/v1/leave-requests` | Submit leave request |
| `PUT` | `/api/v1/leave-requests/:id/approve` | Approve leave request |
| `PUT` | `/api/v1/leave-requests/:id/reject` | Reject leave request |
| `GET` | `/api/v1/leave-balances` | Get leave balances |

### Payroll

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `GET` | `/api/v1/payroll-periods` | List payroll periods |
| `POST` | `/api/v1/payroll-periods` | Create payroll period |
| `GET` | `/api/v1/payroll-disbursements` | List disbursements |
| `POST` | `/api/v1/payroll-disbursements` | Process disbursement |

### Users & Roles

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `GET` | `/api/v1/users` | List all users |
| `GET` | `/api/v1/roles` | List all roles |
| `POST` | `/api/v1/roles` | Create role |
| `GET` | `/api/v1/permissions` | List all permissions |

> 📖 **Full API documentation** is available via Swagger UI at `/api-docs` when the server is running.

---

## 🛡️ Input Validation

All API endpoints use **Zod schemas** for request validation. Each module defines its own schema (e.g., `auth.schema.js`, `employee.schema.js`) which is:

1. **Documented in Swagger** — request body schemas are visible in the interactive API docs with field types, required/optional markers, and examples.
2. **Enforced at runtime** — invalid requests are rejected with structured error responses before reaching the controller.
3. **Type-safe** — schemas are co-located with routes and services, keeping validation rules close to where they're used.

### Validation Flow

```
Client Request
      │
      ▼
┌─────────────┐
│  Middleware  │  ← Auth, Rate Limiting, CORS
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Zod Schema  │  ← Validates body, params, query
└──────┬──────┘
       │
       ├── ❌ Invalid → 400 { success: false, message, code }
       │
       ▼
┌─────────────┐
│ Controller  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Service    │  ← Business logic
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Prisma    │  ← Type-safe DB queries
└─────────────┘
```

### Example: Validation Error Response

```json
{
  "success": false,
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email address"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ]
}
```

---

## 📜 Scripts

### Backend Scripts

| Command | Description |
|:--------|:------------|
| `npm start` | Start production server |
| `npm run dev` | Start development server with Nodemon |
| `npm test` | Run test suite |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Run ESLint with auto-fix |
| `npm run format` | Format code with Prettier |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Run Prisma migrations |
| `npm run prisma:seed` | Seed database |

### Frontend Scripts

| Command | Description |
|:--------|:------------|
| `npm run dev` | Start Vite dev server (port 5173) |
| `npm run build` | Create production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run TypeScript type check |
| `npm test` | Run Vitest test suite |
| `npm run test:watch` | Run tests in watch mode |

---

## 📸 Screenshots

> 🚧 **Coming soon!** Screenshots will be added once the UI is finalized.

<!-- Uncomment and replace with actual screenshots -->

<table>
<tr>
<td align="center">
  <img alt="Dashboard" src="https://github.com/user-attachments/assets/f60396b3-bfea-446e-a60b-7aa3e51ee3eb" />
  <br />
  <em>Admin Dashboard</em>
</td>
<td align="center">
  <img alt="Image" src="https://github.com/user-attachments/assets/6423737e-11f5-4496-9a8f-1ab650e7e6b6" />
  <br />
  <em>Audit Logging System</em>
</td>
</tr>
<tr>
<td align="center">
  <img alt="Attendance Devices Support" src="https://github.com/user-attachments/assets/afb7611b-e256-4d78-84df-7a25846f4f3d" />
  <br />
  <em>Attendance Devices Support</em>
</td>
<td align="center">
<img alt="Reviewing And Rating System" src="https://github.com/user-attachments/assets/de5f8277-7dc7-40bb-9834-1de0217a4a67" />
  <br />
  <em>Reviewing And Rating System</em>
</td>
<td align="center">
  <img alt="Bank Accounts Management" src="https://github.com/user-attachments/assets/4425db77-3fdf-496d-89fe-635d95a16d83" />
  <br />
  <em>Bank Accounts Management</em>
</td>
<td align="center">
<img alt="Payroll Processing" src="https://github.com/user-attachments/assets/2c25b377-1c9e-4247-aa70-4e8aa1da9230" />
  <br />
  <em>Payroll Processing</em>
</td>
</tr>
</table>


---

## 🚀 Deployment

Nexus-ESS can be deployed to various cloud platforms:

### Supported Platforms

| Platform | Frontend | Backend | Database | Notes |
|:---------|:---------|:--------|:---------|:------|
| **Vercel** | ✅ | ✅ | — | Recommended for frontend |
| **Netlify** | ✅ | — | — | Static frontend hosting |
| **Render** | ✅ | ✅ | ✅ | Full-stack support |
| **Railway** | ✅ | ✅ | ✅ | Easy PostgreSQL hosting |
| **Docker** | ✅ | ✅ | ✅ | Containerized deployment |
| **AWS** | S3/CloudFront | EC2/ECS | RDS | Enterprise-grade |

### Docker

```dockerfile
# Example Dockerfile (backend)
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
EXPOSE 3000
CMD ["node", "src/server.js"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: ess_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://postgres:password@db:5432/ess_db
      JWT_SECRET: your-secret-key
      JWT_REFRESH_SECRET: your-refresh-secret
    depends_on:
      - db

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  pgdata:
```

### Environment-Specific Notes

- **Production:** Set `NODE_ENV=production`, use strong JWT secrets, enable HTTPS.
- **Staging:** Mirror production config with test data.
- **Development:** Use local PostgreSQL, relaxed CORS settings.

---

## 🔒 Security

Nexus-ESS implements multiple layers of security to protect sensitive employee data:

| Feature | Implementation | Details |
|:--------|:---------------|:--------|
| **Authentication** | JWT (JSON Web Tokens) | Short-lived access tokens (15 min) with refresh token rotation |
| **Password Hashing** | bcrypt | Salted hashing with configurable rounds |
| **RBAC** | Role-Based Access Control | Granular permissions per module, role-permission mapping |
| **Input Validation** | Zod schemas | Request validation on both client and server, documented via Swagger |
| **Rate Limiting** | express-rate-limit | Prevents brute-force and DDoS attacks |
| **Security Headers** | Helmet.js | Sets secure HTTP headers automatically |
| **CORS** | CORS middleware | Restricts cross-origin requests to allowed origins |
| **SQL Injection** | Prisma ORM | Parameterized queries — no raw SQL concatenation |
| **Refresh Tokens** | Database-stored, hashed | Token rotation with revocation support |
| **Account Lockout** | Failed attempt tracking | Automatic lock after configurable failed login attempts |
| **Audit Logging** | AuditLog model | Tracks all significant data changes with user/IP |
| **Environment Variables** | dotenv | Secrets kept out of source code |

> 🔐 **Best Practice:** Always use HTTPS in production. Never store secrets in version control. Rotate JWT secrets periodically.

---

## 🗺️ Future Enhancements

| Priority | Feature | Description |
|:--------:|:--------|:------------|
| 🔴 | **Mobile App** | React Native companion app for on-the-go access |
| 🔴 | **Email Notifications** | Full email integration for leave approvals, payroll, etc. |
| 🟡 | **Advanced Analytics** | Detailed workforce analytics with exportable reports |
| 🟡 | **Shift Swap** | Employee-initiated shift swap requests |
| 🟡 | **Org Chart** | Interactive organizational chart visualization |
| 🟡 | **Document Expiry Alerts** | Auto-notifications for expiring certifications |
| 🟢 | **Multi-Language** | Additional language packs beyond Arabic (already supported) |
| 🟢 | **Two-Factor Auth** | TOTP-based 2FA for enhanced security |
| 🟢 | **Webhook Support** | Configurable webhooks for system integrations |
| 🟢 | **LDAP Integration** | Enterprise directory service authentication |
| ⚪ | **Workflow Engine** | Configurable approval workflows for various requests |
| ⚪ | **Knowledge Base** | Internal company knowledge base and documentation |

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

### Getting Started

1. **Fork** the repository
2. **Clone** your fork:
   ```bash
   git clone https://github.com/AnasHaidar-95/nexus-ess.git
   ```
3. **Create** a feature branch:
   ```bash
   git checkout -b feature/amazing-feature
   ```
4. **Make** your changes
5. **Run** tests:
   ```bash
   # Backend
   cd backend && npm test

   # Frontend
   cd frontend && npm test
   ```
6. **Commit** your changes:
   ```bash
   git commit -m "feat: add amazing feature"
   ```
7. **Push** to your branch:
   ```bash
   git push origin feature/amazing-feature
   ```
8. **Open** a Pull Request

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix | Description |
|:-------|:------------|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation changes |
| `style:` | Code style changes (formatting, etc.) |
| `refactor:` | Code refactoring |
| `test:` | Adding or updating tests |
| `chore:` | Maintenance tasks |

### Code Guidelines

- Follow existing code patterns and conventions
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

---

## 📄 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2026 Nexus-ESS

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 👨‍💻 Author

**Your Name** — [@AnasHaidar-95](https://github.com/AnasHaidar-95)

- 🔗 GitHub: [github.com/AnasHaidar-95](https://github.com/AnasHaidar-95)
- 📧 Email: anas.haidar1995@gmail.com
- 💼 LinkedIn: [linkedin.com/in/anas-haidar](https://linkedin.com/in/anas-haidar)

---

## 💬 Support

Having issues? Here's how to get help:

| Channel | Link | Description |
|:--------|:-----|:------------|
| 🐛 **Bug Reports** | [GitHub Issues](https://github.com/AnasHaidar-95/nexus-ess/issues) | Report bugs and request features |
| 💡 **Feature Requests** | [GitHub Discussions](https://github.com/AnasHaidar-95/nexus-ess/discussions) | Share ideas and suggestions |
| 📧 **Email** | [support@nexus-ess.com](mailto:support@nexus-ess.com) | Direct support inquiries |
| 📖 **Documentation** | [Wiki](https://github.com/AnasHaidar-95/nexus-ess/wiki) | Project documentation |

---

<div align="center">

**Made with ❤️ by the [AnasHaidar-95](https://github.com/AnasHaidar-95)**

⭐ Star this repo if you find it useful!

</div>
