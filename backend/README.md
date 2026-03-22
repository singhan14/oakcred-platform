# CreditIQ — Backend API

A production-grade REST API for CreditIQ, a B2B SaaS platform that helps Indian CA firms assess MSME and individual borrower creditworthiness using GST data, ITR records, bank statements, and AI-based behavioral scoring.

## Tech Stack

- **Runtime**: Node.js 20 + Express
- **Database**: PostgreSQL via Prisma ORM
- **Auth**: JWT (access + refresh tokens in HttpOnly cookies)
- **Queue**: Bull + Redis for background jobs
- **Storage**: Azure Blob Storage (local fallback in dev)
- **PDF**: Puppeteer for report generation
- **Email/SMS**: SendGrid + Twilio (mock mode available)
- **Payments**: Razorpay subscriptions (mock mode available)

## Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 14+
- Redis (optional, for job queues)

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your database URL

# 3. Generate Prisma client
npx prisma generate

# 4. Run database migrations
npx prisma migrate dev --name init

# 5. Seed demo data
npm run seed

# 6. Start server
npm run dev
```

### Demo Credentials
- **Email**: `demo@creditiq.in`
- **Password**: `Demo@1234`

## API Endpoints

### Health Check
```
GET /api/health
```

### Authentication (`/api/auth`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /register | No | Register firm + admin |
| POST | /verify-email | No | Verify email token |
| POST | /login | No | Get access + refresh token |
| POST | /refresh | Cookie | Rotate tokens |
| POST | /logout | No | Clear refresh cookie |
| POST | /forgot-password | No | Send reset email |
| POST | /reset-password | No | Reset with token |
| GET | /me | Bearer | Current user info |

### Borrowers (`/api/borrowers`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | / | Bearer | Create borrower |
| GET | / | Bearer | List (search, filter, paginate) |
| GET | /:id | Bearer | Get with full data |
| PUT | /:id | Bearer | Update |
| DELETE | /:id | Bearer | Soft delete |
| POST | /:id/consent | Bearer | Send consent request |
| GET | /:id/consent | Bearer | Consent status |
| GET | /:id/history | Bearer | Assessment history |

### Data Ingestion (`/api/data`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /:borrowerId/sync-gst | Bearer | Fetch GST records |
| POST | /:borrowerId/upload-itr | Bearer | Upload ITR PDF |
| POST | /:borrowerId/upload-bank-statement | Bearer | Upload bank PDF |
| POST | /:borrowerId/manual-entry | Bearer | Manual data entry |

### Assessments (`/api/assessments`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /:borrowerId/run | Bearer | Run credit assessment |
| GET | /:borrowerId | Bearer | Get latest assessment |
| GET | /:borrowerId/history | Bearer | All assessments |
| GET | /:id/report | Bearer | Get report URL |
| POST | /:id/generate-report | Bearer | Generate PDF report |

### Monitoring (`/api/monitoring`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /:assessmentId/start | Bearer | Start monitoring |
| GET | /dashboard | Bearer | All monitored borrowers |
| GET | /:id | Bearer | Single monitor |
| PUT | /:id/update | Bearer | Update EMI status |
| POST | /bulk-check | Bearer | Bulk health check |

### Billing (`/api/billing`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /plans | No | List plans |
| POST | /subscribe | Bearer | Subscribe to plan |
| POST | /verify | Bearer | Verify payment |
| GET | /subscription | Bearer | Current subscription |
| DELETE | /subscription | Bearer | Cancel subscription |

### Consent (`/api/consent`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /request | Bearer | Create consent request |
| GET | /public/:token | No | Public consent page |
| POST | /respond/:token | No | Approve/reject (OTP) |
| GET | /:borrowerId/status | Bearer | Consent status |

## Azure Deployment

### Resources (via Bicep)
```bash
az group create --name creditiq-rg --location eastus
az deployment group create --resource-group creditiq-rg --template-file deploy/azure/main.bicep
```

### CI/CD
Push to `main` branch triggers GitHub Actions: install → test → deploy to Azure App Service.

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start with hot reload |
| `npm run seed` | Load demo data |
| `npm run migrate` | Run Prisma migrations |
| `npm test` | Run Jest tests |
| `npm run studio` | Open Prisma Studio |
