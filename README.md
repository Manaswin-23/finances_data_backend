# Finance Data Processing and Access Control Backend

A full-stack finance dashboard system built with **Node.js + TypeScript**, featuring JWT-based authentication, role-based access control (RBAC), financial records management, dashboard analytics, and a React frontend.

---

## 📋 Assignment Fulfillment Checklist

| Requirement | Implementation | Status |
|---|---|---|
| User & Role Management | `POST /api/auth/register`, `/api/users` endpoints | ✅ |
| Role-Based Access Control | `protect` + `restrictTo` middleware | ✅ |
| Active / Inactive User Status | `PATCH /api/users/:id/status` + auth guard | ✅ |
| Financial Records CRUD | Full `/api/transactions` REST routes | ✅ |
| Filtering (date, type, category, search) | Query params on `GET /api/transactions` | ✅ |
| Dashboard Summary API | `GET /api/dashboard/summary` | ✅ |
| Total income / expenses / net balance | Prisma `_sum` aggregations | ✅ |
| Category-wise totals | Prisma `groupBy` query | ✅ |
| Weekly trends | Daily aggregation (last 7 days) | ✅ |
| Monthly trends | Monthly aggregation (last 6 months) | ✅ |
| Recent activity | Last 5 transactions | ✅ |
| Input validation | Zod schemas on all write endpoints | ✅ |
| Error handling | Global Express error handler + `AppError` class | ✅ |
| Correct HTTP status codes | 201, 400, 401, 403, 404, 204, 500 | ✅ |
| Data persistence | SQLite via Prisma ORM | ✅ |
| Token-based authentication (Optional) | JWT (7-day expiry) | ✅ |
| Pagination (Optional) | `?page=1&limit=10` on transaction listing | ✅ |
| Soft delete (Optional) | `deletedAt` timestamp pattern | ✅ |
| Rate limiting (Optional) | `express-rate-limit` middleware | ✅ |
| Integration tests (Optional) | Jest + Supertest | ✅ |
| Frontend Dashboard (Optional) | React + Vite + Recharts | ✅ |

---

## 🏗 Architecture Overview

```
Finance data processing Backend/
├── src/
│   ├── controllers/        # HTTP request handlers (thin layer)
│   │   ├── authController.ts
│   │   ├── transactionController.ts
│   │   ├── dashboardController.ts
│   │   └── userController.ts
│   ├── services/           # Business logic (all heavy lifting here)
│   │   ├── authService.ts
│   │   ├── transactionService.ts
│   │   ├── dashboardService.ts
│   │   └── userService.ts
│   ├── routes/             # Express route definitions
│   │   ├── authRoutes.ts
│   │   ├── transactionRoutes.ts
│   │   ├── dashboardRoutes.ts
│   │   └── userRoutes.ts
│   ├── middleware/
│   │   ├── authMiddleware.ts   # JWT protect + restrictTo
│   │   ├── errorMiddleware.ts  # Global error handler + AppError
│   │   └── rateLimiter.ts      # express-rate-limit
│   ├── utils/
│   │   └── prisma.ts           # Prisma client singleton
│   ├── __tests__/
│   │   └── integration.test.ts
│   ├── app.ts              # Express app setup
│   └── server.ts           # Server entry point
├── prisma/
│   ├── schema.prisma       # Data models
│   └── migrations/
├── frontend/               # React dashboard (Vite)
│   └── src/
│       ├── pages/          # Dashboard, Transactions, Login, Users
│       ├── components/     # Sidebar, Card, Chart wrappers
│       └── services/       # API client + JWT util
├── .env
├── package.json
└── README.md
```

### Design Pattern: Controller → Service → Prisma

All business logic is **separated from HTTP handling**:
- **Controllers** only parse requests, call services, and format responses
- **Services** contain all database queries and business rules
- **Middleware** handles cross-cutting concerns (auth, errors, rate limits)

---

## 🛠 Tech Stack

**Backend**
- **Node.js 18+ with TypeScript** — Type-safe backend
- **Express.js** — REST API framework
- **Prisma ORM** — Type-safe database client + migrations
- **SQLite** — Embedded database (zero configuration)
- **Zod** — Runtime schema validation
- **bcryptjs** — Password hashing (12 rounds)
- **jsonwebtoken** — JWT token signing & verification
- **express-rate-limit** — Request rate limiting

**Frontend** (in `/frontend`)
- **React 18 + Vite** — Fast SPA development
- **Recharts** — Data visualization charts
- **Vanilla CSS** — Custom glassmorphism design system
- **lucide-react** — Icon library

**Testing**
- **Jest** — Test runner
- **Supertest** — HTTP integration testing

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- npm

### 1. Clone & Install

```bash
# Install backend dependencies
npm install

# Initialize database (creates dev.db and runs migrations)
npx prisma migrate dev --name init

# Generate Prisma types
npx prisma generate
```

### 2. Environment Configuration

Create or verify `.env` in the project root:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
NODE_ENV="development"
PORT=3000
```

### 3. Start the Backend

```bash
npm run dev
# Server starts at http://localhost:3000
```

### 4. Start the Frontend (separate terminal)

```bash
cd frontend
npm install
npm run dev
# Frontend dev server at http://localhost:5173
```

### 5. Production Build (single server)

```bash
cd frontend && npm run build && cd ..
npm run dev
# Access everything at http://localhost:3000
```

---

## 🔐 Default Test Users

The system starts empty. Register users via the API or frontend, then promote one to Admin:

```bash
# 1. Register first user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin User","email":"admin@example.com","password":"password123"}'

# 2. Directly promote to Admin using Prisma Studio
npx prisma studio
# Navigate to User table → change role to ADMIN

# 3. Now log in and use the Admin token for privileged operations
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'
```

---

## 📚 Complete API Reference

The interactive API documentation is available via **Swagger UI** at:
`http://localhost:3000/api-docs`

All routes are prefixed with `/api`. Protected routes require:
```
Authorization: Bearer <jwt_token>
```

---

### 🔑 Authentication

#### `POST /api/auth/register`
Register a new user. New users default to `VIEWER` role.

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "securepassword"
}
```

**Response `201`:**
```json
{
  "status": "success",
  "token": "<jwt>",
  "data": { "user": { "id": "...", "email": "...", "name": "...", "role": "VIEWER" } }
}
```

---

#### `POST /api/auth/login`
Authenticate and receive a JWT token.

**Request Body:**
```json
{
  "email": "jane@example.com",
  "password": "securepassword"
}
```

**Response `200`:** Same structure as register.

**Error cases:**
- `401` — Invalid credentials
- `403` — Account is inactive

---

### 📊 Dashboard (Requires Auth — All Roles)

#### `GET /api/dashboard/summary`
Returns all aggregated data for the dashboard in a single request.

**Response `200`:**
```json
{
  "status": "success",
  "data": {
    "totalIncome": 15000.00,
    "totalExpenses": 8500.00,
    "netBalance": 6500.00,
    "categoryBreakdown": [
      { "category": "Salary", "_sum": { "amount": 12000 } },
      { "category": "Food", "_sum": { "amount": 1500 } }
    ],
    "recentActivity": [ /* last 5 transactions */ ],
    "trends": [
      { "date": "2026-03-28", "INCOME": 500, "EXPENSE": 200, "amount": 300 }
    ],
    "monthlyTrends": [
      { "month": "2026-01", "label": "Jan 26", "INCOME": 5000, "EXPENSE": 2000 }
    ]
  }
}
```

---

### 💰 Transactions (Requires Auth)

#### `POST /api/transactions` — Admin Only
Create a new financial record.

**Request Body:**
```json
{
  "amount": 2500.00,
  "type": "INCOME",
  "category": "Salary",
  "date": "2026-04-01",
  "description": "Monthly salary"
}
```

**Validation rules:**
- `amount` — required, must be a positive number
- `type` — required, must be `"INCOME"` or `"EXPENSE"`
- `category` — required string
- `date` — optional ISO date string, defaults to now
- `description` — optional string

**Response `201`:** Returns the created transaction.

---

#### `GET /api/transactions` — All Roles
Retrieve transactions with filtering and pagination.

**Query Parameters:**
| Parameter | Type | Description |
|---|---|---|
| `page` | number | Page number (default: 1) |
| `limit` | number | Results per page (default: 10) |
| `type` | `INCOME` \| `EXPENSE` | Filter by transaction type |
| `category` | string | Exact category match |
| `startDate` | ISO date | Filter from this date (inclusive) |
| `endDate` | ISO date | Filter to this date (inclusive) |
| `search` | string | Search in description and category |

**Example:**
```
GET /api/transactions?type=EXPENSE&category=Food&startDate=2026-01-01&page=1&limit=5
```

**Response `200`:**
```json
{
  "status": "success",
  "results": 5,
  "total": 23,
  "page": 1,
  "totalPages": 5,
  "data": { "transactions": [ /* array */ ] }
}
```

---

#### `GET /api/transactions/:id` — All Roles
Retrieve a single transaction by ID.

**Response `404`** if not found or soft-deleted.

---

#### `PATCH /api/transactions/:id` — Admin Only
Update any field of a transaction. All fields are optional (partial update).

**Request Body (all optional):**
```json
{
  "amount": 3000,
  "category": "Freelance",
  "description": "Updated description"
}
```

---

#### `DELETE /api/transactions/:id` — Admin Only
Soft-deletes a transaction by setting `deletedAt` timestamp. The record is retained in the database for audit purposes but excluded from all queries.

**Response `204` (No Content)**

---

### 👥 User Management (Admin Only)

#### `GET /api/users`
List all users in the system.

**Response `200`:**
```json
{
  "status": "success",
  "results": 3,
  "data": {
    "users": [
      { "id": "...", "name": "...", "email": "...", "role": "ADMIN", "status": "ACTIVE", "createdAt": "..." }
    ]
  }
}
```

---

#### `POST /api/users`
Create a new user directly (Admin bypasses registration flow and can set any role).

**Request Body:**
```json
{
  "name": "Analyst User",
  "email": "analyst@example.com",
  "password": "password123",
  "role": "ANALYST"
}
```

---

#### `PATCH /api/users/:id/role`
Update a user's role.

**Request Body:**
```json
{ "role": "ANALYST" }
```

**Valid values:** `VIEWER`, `ANALYST`, `ADMIN`

---

#### `PATCH /api/users/:id/status`
Activate or deactivate a user's account. Deactivated users are immediately blocked from all API access.

**Request Body:**
```json
{ "status": "INACTIVE" }
```

**Valid values:** `ACTIVE`, `INACTIVE`

---

#### `DELETE /api/users/:id`
Permanently remove a user account (hard delete).

**Response `204` (No Content)**

---

## 🛡 Role-Based Access Control Matrix

| Action | VIEWER | ANALYST | ADMIN |
|---|:---:|:---:|:---:|
| Login / Register | ✅ | ✅ | ✅ |
| View dashboard summary | ✅ | ✅ | ✅ |
| List transactions | ✅ | ✅ | ✅ |
| View single transaction | ✅ | ✅ | ✅ |
| Create transaction | ❌ | ❌ | ✅ |
| Update transaction | ❌ | ❌ | ✅ |
| Delete transaction | ❌ | ❌ | ✅ |
| List users | ❌ | ❌ | ✅ |
| Create user | ❌ | ❌ | ✅ |
| Change user role | ❌ | ❌ | ✅ |
| Activate/deactivate user | ❌ | ❌ | ✅ |
| Delete user | ❌ | ❌ | ✅ |

---

## 🗄 Data Schema (Prisma)

```prisma
model User {
  id           String        @id @default(uuid())
  email        String        @unique
  password     String        // bcrypt hashed, 12 rounds
  name         String?
  role         Role          @default(VIEWER)    // VIEWER | ANALYST | ADMIN
  status       UserStatus    @default(ACTIVE)    // ACTIVE | INACTIVE
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  transactions Transaction[]
}

model Transaction {
  id          String          @id @default(uuid())
  amount      Float           // Must be positive (enforced by Zod)
  type        TransactionType // INCOME | EXPENSE
  category    String
  date        DateTime        @default(now())
  description String?
  userId      String?         // Nullable (creator; SetNull on user delete)
  deletedAt   DateTime?       // Soft delete — null means active
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt
}
```

---

## ⚠️ Error Response Format

All errors follow a consistent format:

```json
{
  "status": "fail",
  "message": "Human-readable error description"
}
```

| Status Code | Meaning |
|---|---|
| `400` | Bad Request — validation failed |
| `401` | Unauthorized — missing or invalid token |
| `403` | Forbidden — insufficient role or inactive account |
| `404` | Not Found — resource doesn't exist |
| `429` | Too Many Requests — rate limit exceeded |
| `500` | Internal Server Error — unexpected failure |

---

## ⚡ Rate Limiting

| Limiter | Window | Max Requests |
|---|---|---|
| Global (all `/api` routes) | 15 minutes | 100 |
| Auth (login endpoint) | 1 hour | 10 |

Rate limit headers are included in all responses (`RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`).

---

## 🧪 Running Tests

```bash
npm test
```

The integration test suite (`src/__tests__/integration.test.ts`) covers:
- User registration and login
- JWT authentication guards
- Role-based access enforcement
- Transaction CRUD operations
- Validation error handling

---

## 🧠 Architectural Decisions & Tradeoffs

### 1. SQLite over PostgreSQL
**Decision:** Used SQLite (via Prisma) instead of PostgreSQL.  
**Reason:** Zero-configuration setup lets reviewers run the project instantly without Docker or cloud credentials. Prisma's abstraction means swapping to PostgreSQL requires only changing `DATABASE_URL` and the `provider` in `schema.prisma`.  
**Tradeoff:** SQLite is not suitable for concurrent high-write production workloads.

### 2. Soft Delete for Transactions
**Decision:** `DELETE /transactions/:id` sets `deletedAt` rather than removing the row.  
**Reason:** Financial systems require an audit trail. Hard deleting financial records could constitute a compliance violation. All queries filter `where: { deletedAt: null }` to exclude soft-deleted records.  
**Tradeoff:** Database grows unbounded. In production, an archival job would move old soft-deleted records to cold storage.

### 3. Controller → Service separation
**Decision:** Strictly separated HTTP logic (controllers) from business logic (services).  
**Reason:** Services can be unit-tested without instantiating an HTTP server. Controllers stay thin and readable.  
**Tradeoff:** More files to navigate for a simple project, but pays off at scale.

### 4. In-memory Rate Limiting
**Decision:** Used `express-rate-limit` with default in-memory store.  
**Reason:** Sufficient for single-instance assessment. The library supports Redis adapters for distributed deployments.  
**Tradeoff:** Rate limit state is lost on server restart and doesn't work across multiple server instances.

### 5. JWT stored in localStorage (Frontend)
**Decision:** Tokens are stored in `localStorage` on the frontend.  
**Reason:** Simplicity for an assessment context.  
**Tradeoff:** Vulnerable to XSS. In production, `httpOnly` cookies are preferred.

### 6. Viewers can read all transactions, not just their own
**Decision:** `GET /transactions` returns all records to authenticated users of any role.  
**Reason:** Finance dashboards typically show company-wide data, not user-scoped data. The assignment specifies "Viewer: Can only view dashboard data" which implies read access.  
**Assumption:** If per-user scoping were required, we would add `where: { userId: req.user.id }` for non-admin roles.

---

## 🚀 Optional Improvements (if extending)

- **Per-user transaction scoping** — Filter `GET /transactions` by `userId` for VIEWER/ANALYST roles
- **Redis-backed rate limiting** — Replace in-memory store for multi-instance deployments
- **Refresh tokens** — Add token rotation for better security
- **Pagination cursor** — Replace offset pagination with cursor-based for large datasets
- **API documentation** — Add Swagger/OpenAPI spec generation
- **PostgreSQL migration** — Change `provider = "sqlite"` to `provider = "postgresql"` in schema
