# Lead Platform

Lead Platform is a lead-generation SaaS application that searches for businesses by **business type** and **location**, extracts business information, and displays the results in a web dashboard.

The project contains:

- A Next.js frontend dashboard
- A FastAPI backend
- Playwright-based browser automation
- Google Maps business discovery/scraping
- Business data extraction and normalization
- Docker support for frontend and backend
- PostgreSQL/Supabase-compatible database configuration
- Alembic database migrations
- Raspberry Pi deployment through GitHub Actions
- Optional Cloudflare Tunnel/systemd deployment support

> **Current status:** The core Google Maps lead discovery flow is implemented. Email enrichment, high-volume pagination, advanced enrichment, recurring delivery, and payment subscriptions are planned features and should be implemented incrementally.

---

## 1. Product Overview

The current application allows a user to enter:

- Business keyword, for example `dentist`, `restaurant`, or `hospital`
- Location, for example `Pune` or `Mumbai`

The application searches for businesses and displays information such as:

- Business name
- Address
- Phone number
- Website URL
- Google Maps URL
- Rating
- Additional business metadata when available

The frontend provides business cards and copy-to-clipboard actions. Search results can be filtered or sorted by rating depending on the active frontend implementation.

---

## 2. Main Technology Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui-compatible components
- Axios
- TanStack Query where configured
- React Hook Form
- Zod
- Sonner notifications

### Backend

- Python 3.11+
- FastAPI
- Uvicorn
- Playwright
- BeautifulSoup
- lxml
- SQLAlchemy 2
- PostgreSQL / Supabase PostgreSQL
- Alembic
- Pydantic Settings

### Infrastructure

- Docker
- Docker Compose
- GitHub Actions
- Raspberry Pi ARM64 self-hosted runner
- systemd
- Cloudflare Tunnel

---

## 3. Repository Structure

```text
lead-platform/
├── backend/
│   ├── alembic/
│   │   ├── env.py
│   │   ├── script.py.mako
│   │   └── versions/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── crawler/
│   │   ├── database/
│   │   ├── discovery/
│   │   ├── enrichment/
│   │   ├── lead_generation/
│   │   ├── models/
│   │   ├── parsers/
│   │   ├── services/
│   │   ├── sources/
│   │   └── utils/
│   ├── alembic.ini
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── services/
│   ├── types/
│   ├── Dockerfile
│   ├── package.json
│   └── .env.local
├── .github/
│   └── workflows/
│       └── deploy.yml
├── docker-compose.yml
└── README.md
```

Some directories may contain additional files as development continues.

---

## 4. Prerequisites

Install the following tools before running the project locally:

- Git
- Python 3.11 or a compatible newer version
- Node.js 20+
- npm
- PostgreSQL or a Supabase PostgreSQL project
- Playwright Chromium dependencies, if running outside Docker
- Docker and Docker Compose, if using containers

Check installed versions:

```bash
git --version
python3 --version
node --version
npm --version
docker --version
docker compose version
```

---

## 5. Clone the Repository

```bash
git clone https://github.com/iamgajanan/lead-platform.git
cd lead-platform
```

---

## 6. Backend Installation

Move into the backend directory:

```bash
cd backend
```

Create a virtual environment:

```bash
python3 -m venv .venv
```

Activate it on macOS/Linux:

```bash
source .venv/bin/activate
```

Activate it on Windows PowerShell:

```powershell
.venv\Scripts\Activate.ps1
```

Upgrade pip:

```bash
python -m pip install --upgrade pip
```

Install Python dependencies:

```bash
pip install -r requirements.txt
```

Install Playwright Chromium:

```bash
playwright install chromium
```

If you are running Playwright on Linux and system dependencies are missing, use:

```bash
playwright install --with-deps chromium
```

> On Raspberry Pi or another ARM64 Linux system, verify that the installed Playwright browser and operating-system libraries are compatible with the architecture.

---

## 7. Backend Environment Variables

Create the environment file:

```bash
cd backend
cp .env.example .env
```

If `.env.example` does not exist yet, create `backend/.env` manually.

Example configuration:

```env
APP_NAME=Lead Platform API
APP_VERSION=1.0.0

DATABASE_URL=postgresql+psycopg2://USER:PASSWORD@HOST:5432/DATABASE

# Optional provider configuration
GEOAPIFY_API_KEY=

# Frontend origin used by FastAPI CORS
FRONTEND_URL=http://localhost:3000
```

### Environment variable notes

- Never commit `.env` files containing passwords, API keys, or private credentials.
- Use a Supabase connection string appropriate for your deployment environment.
- Confirm that the SQLAlchemy database URL uses the correct PostgreSQL driver.
- Keep production secrets in the server environment or GitHub Actions secrets.

---

## 8. Database Setup

The project uses SQLAlchemy models and Alembic migrations.

Run migrations from the `backend` directory:

```bash
alembic upgrade head
```

Check the current migration version:

```bash
alembic current
```

View migration history:

```bash
alembic history
```

### Creating a new migration

After changing SQLAlchemy models:

```bash
alembic revision --autogenerate -m "describe the schema change"
```

Review the generated migration before applying it:

```bash
alembic upgrade head
```

### Important database guidance

- Use Alembic as the primary schema-management mechanism.
- Do not depend on `Base.metadata.create_all()` for production migrations.
- Ensure all SQLAlchemy models are imported into the Alembic metadata before using `--autogenerate`.
- Keep one shared declarative `Base` for the application models.
- Confirm that the migration is connected to the same database shown in Supabase or PostgreSQL.

---

## 9. Run the Backend Locally

From the `backend` directory, with the virtual environment activated:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

The backend will be available at:

```text
http://localhost:8001
```

FastAPI Swagger documentation:

```text
http://localhost:8001/docs
```

ReDoc documentation:

```text
http://localhost:8001/redoc
```

### Basic backend checks

```bash
curl http://localhost:8001/
curl http://localhost:8001/health
```

If the database test endpoint is enabled:

```bash
curl http://localhost:8001/api/db-test
```

---

## 10. Run the Frontend Locally

Open another terminal and move to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create the frontend environment file if needed:

```bash
cp .env.example .env.local
```

Example:

```env
NEXT_PUBLIC_API_URL=http://localhost:8001/api/v1
```

Start the development server:

```bash
npm run dev
```

The frontend will be available at:

```text
http://localhost:3000
```

### Frontend commands

```bash
npm run dev
npm run build
npm run start
npm run lint
```

---

## 11. Run with Docker Compose

From the repository root:

```bash
docker compose up --build
```

Run in the background:

```bash
docker compose up -d --build
```

View logs:

```bash
docker compose logs -f backend
docker compose logs -f frontend
```

Stop the services:

```bash
docker compose down
```

The current Compose configuration exposes the services on ports similar to:

- Frontend: `3000`
- Backend: `8001`

Before using Docker in production, verify the frontend API URL. A browser-based frontend cannot use a Docker-internal hostname unless the request is made server-side. Use a browser-reachable backend URL for `NEXT_PUBLIC_API_URL`.

---

## 12. API Usage

### Search request

The search endpoint accepts a business keyword and location.

Example request:

```http
POST /api/v1/search
Content-Type: application/json
```

```json
{
  "keyword": "dentist",
  "location": "Pune"
}
```

Example cURL:

```bash
curl -X POST "http://localhost:8001/api/v1/search" \
  -H "Content-Type: application/json" \
  -d '{
    "keyword": "dentist",
    "location": "Pune"
  }'
```

The exact response fields depend on the active discovery provider and parser implementation. Typical fields include:

```json
{
  "name": "Example Dental Clinic",
  "address": "Pune, Maharashtra",
  "phone": "+91XXXXXXXXXX",
  "website": "https://example.com",
  "google_maps_url": "https://maps.google.com/...",
  "rating": 4.5
}
```

---

## 13. Implemented Development Milestones

The project has evolved through the following major milestones:

### Initial Google Maps scraper

- Added the initial Next.js and FastAPI application.
- Implemented Google Maps browser automation.
- Added business result extraction.
- Added fields such as name, rating, address, phone, website, and Google Maps URL.
- Added frontend result cards.

### Backend organization

- Added FastAPI application structure.
- Added service-layer organization.
- Added schemas for search and business results.
- Added configuration and logging modules.
- Added database/session structure.

### Browser automation and parsing

- Added Playwright browser management.
- Added Chromium launch configuration.
- Added HTML parsing with BeautifulSoup and lxml.
- Added URL normalization and link extraction.
- Added screenshot support for scraped pages.
- Added error handling around browser and page lifecycle.

### Database and migrations

- Added SQLAlchemy models and database configuration.
- Added Alembic configuration.
- Added migration files for the initial database tables and lead-related tables.
- Added database connectivity checks.

### Deployment

- Added backend and frontend Dockerfiles.
- Added Docker Compose configuration.
- Added production deployment configuration for Raspberry Pi.
- Added GitHub Actions deployment workflow for the self-hosted ARM64 runner.
- Added service restart and basic service verification steps.
- Added support for deployment behind Cloudflare Tunnel and systemd services.

### Provider experimentation

- Added provider-oriented discovery architecture.
- Evaluated a provider-based search approach instead of depending exclusively on Google Maps browser scraping.
- Added an API provider abstraction for future official API integrations.
- Evaluated Geoapify for location-based business discovery.

---

## 14. Testing Checklist

### Backend startup test

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8001
```

Confirm:

- The process starts without import errors.
- The `/health` endpoint responds.
- Swagger opens at `/docs`.

### Database test

```bash
alembic current
alembic upgrade head
```

Confirm:

- The configured database is reachable.
- Migrations complete successfully.
- Expected tables are visible in PostgreSQL/Supabase.

### Search API test

Send a request with a known business keyword and city:

```json
{
  "keyword": "dentist",
  "location": "Pune"
}
```

Confirm:

- The endpoint returns HTTP 200 for a successful search.
- The response is valid JSON.
- Business names are not empty.
- Rating values are parsed safely when present.
- Missing phone numbers or websites do not crash the request.
- A failed individual result does not terminate the entire search unnecessarily.

### Frontend test

```bash
npm run lint
npm run build
```

Confirm:

- The search form submits correctly.
- Loading state is displayed.
- Results are rendered as cards.
- Copy-to-clipboard actions work.
- Empty results are handled.
- API errors are shown to the user.
- The frontend uses the correct backend URL.

### Browser automation test

Confirm:

- Chromium launches successfully.
- The scraper can open a public page.
- Page navigation timeout is handled.
- Browser contexts are closed in `finally` blocks.
- Screenshots use unique filenames and do not overwrite earlier screenshots.

---

## 15. Troubleshooting

### Playwright browser is missing

```bash
playwright install chromium
```

For Linux:

```bash
playwright install --with-deps chromium
```

### Backend returns 500

Check the backend logs and verify:

- The virtual environment is active.
- All requirements are installed.
- The `.env` file exists.
- The database URL is valid.
- The requested website is reachable.
- Playwright Chromium is installed.

### Database connection fails

Check:

```bash
alembic current
```

Verify:

- Database host and port
- Database username and password
- SSL requirements for Supabase
- PostgreSQL driver in `DATABASE_URL`
- Network access from the current machine

### CORS error in the frontend

Verify that the backend allows the frontend origin, for example:

```text
http://localhost:3000
```

Also confirm that the frontend is calling the correct API URL.

### Docker service cannot reach the backend

Check:

```bash
docker compose ps
docker compose logs -f backend
```

Remember that `localhost` inside a container refers to that container itself, not another service or the host machine.

### Search returns very few results

The current discovery implementation may have a provider-specific result limit. High-volume pagination and broader result collection are planned separately and should not be assumed to be implemented yet.

---

## 16. Deployment to Raspberry Pi

The project includes a GitHub Actions workflow designed for a self-hosted Linux ARM64 runner.

The deployment workflow generally performs the following actions:

1. Updates the repository to the latest `main` commit.
2. Installs frontend dependencies.
3. Builds the frontend.
4. Installs backend Python dependencies.
5. Restarts the frontend systemd service.
6. Restarts the backend systemd service.
7. Verifies that both services are active.

Before using the workflow, configure:

- A self-hosted ARM64 GitHub Actions runner
- The expected repository path on the Raspberry Pi
- Python virtual environment path
- Required `.env` files
- systemd services such as `leadfrontend` and `leadapi`
- Correct permissions for the deployment user
- Cloudflare Tunnel routing, if applicable

The workflow should be tested manually on the Raspberry Pi before relying on automatic deployments.

---

## 17. Security and Compliance Notes

- Do not commit API keys or database credentials.
- Respect the terms of service and robots policies of websites being accessed.
- Do not bypass authentication, CAPTCHAs, paywalls, or access controls.
- Collect only publicly available business information that is appropriate for the intended use.
- Add rate limits, timeouts, retry limits, and concurrency limits before scaling scraping volume.
- Store only the data required for the product's purpose.
- Provide appropriate deletion and data-retention controls before launching a commercial service.
- Validate and sanitize scraped content before displaying it in the frontend.
- Treat scraped pages and extracted content as untrusted input.

---

## 18. Planned Roadmap

The following items are planned and should be implemented one feature at a time:

1. **Email enrichment**
   - Crawl business websites.
   - Discover `/contact`, `/about`, and related pages.
   - Extract visible emails and `mailto:` links.
   - Handle JavaScript-rendered pages.
   - Verify discovered emails through a third-party provider.

2. **High-volume pagination**
   - Increase result collection from small result sets to 50–100+ where the data source permits it.
   - Add deduplication and pagination controls.

3. **Parallel and asynchronous processing**
   - Process independent enrichment jobs concurrently.
   - Add concurrency limits, timeouts, and retries.
   - Measure performance before and after optimization.

4. **CSV and Excel export**
   - Export search results.
   - Export enriched fields.
   - Handle large result sets through streaming or background jobs.

5. **Niche landing pages**
   - Start with dental clinics in India.
   - Add SEO-focused content and structured landing page metadata.

6. **Scheduled delivery**
   - Add recurring searches.
   - Deliver results through email or other supported channels.
   - Track job status and delivery history.

7. **Payments and subscriptions**
   - Integrate Razorpay for India-focused billing.
   - Add plans, usage limits, subscription status, webhooks, and payment failure handling.

---

## 19. Contribution Workflow

Create a feature branch:

```bash
git checkout -b feature/feature-name
```

Make and test your changes:

```bash
# Backend
pytest

# Frontend
npm run lint
npm run build
```

Review the changed files:

```bash
git status
git diff
```

Commit your changes:

```bash
git add .
git commit -m "Describe the change"
```

Push the branch:

```bash
git push -u origin feature/feature-name
```

Open a pull request into `main` after testing.

---

## 20. License

Add the project's intended license here before public distribution or commercial use.
