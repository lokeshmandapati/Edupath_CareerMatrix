# CareerMatrix — Career Path Prediction System

Full-stack app: **React (Vite)** + **Tailwind CSS** frontend, **Spring Boot** REST API, **MySQL** or **H2** database, **JWT** authentication, and a **branch-aware CareerFit Prediction Algorithm (CFPA)** that scores **expanded career titles** using skill/interest mappings, **branch priors**, and optional **cross-branch** boosts. Includes **AI career chat** and **branch-aware career roadmaps** (rich steps with tools, projects, and resources when data or OpenAI is available).

See **`requirements.txt`** for runtime prerequisites, where dependency manifests live (`pom.xml` / `package.json`), and notes on **mapping JSON files**.

## Project structure

```
careermatrix/
├── backend/                 # Spring Boot 3.2, Java 17+
│   └── src/main/java/com/smartcareer/   # (package name unchanged)
│       ├── config/          # Security + CORS
│       ├── controller/      # REST (auth, prediction, chat, roadmap, profile)
│       ├── dto/             # Request/response records
│       ├── entity/          # JPA entities
│       ├── exception/       # Global error JSON
│       ├── repository/      # Spring Data JPA
│       ├── security/        # JWT filter + token service
│       └── service/         # Auth, CFPA, mappings, OpenAI (optional), chat, roadmap, branch mapping
│   └── src/main/resources/
│       ├── application.properties
│       ├── cfpa-mappings.json       # Skill/interest → legacy domain weights (see npm run generate:cfpa)
│       ├── branch-career-config.json  # CFPA: branch priors, legacy→career projection, cross-branch rules
│       ├── BranchCareerMapping.json   # Branches, careers by branch, chat hints, rich roadmaps
│       └── roadmaps.json            # Legacy predefined roadmaps (five canonical domains)
├── frontend/                # React 18 + Vite + Tailwind
│   └── src/
│       ├── components/      # Navbar, Chatbot, SkillInterestPicker, RoadmapCard, etc.
│       ├── constants/       # e.g. localStorage keys
│       ├── context/         # Auth (token + branch in localStorage)
│       ├── data/            # assessmentOptions.js — skills, interests, engineering branches
│       ├── pages/           # Login, Signup, Dashboard, Career form, Results, Roadmap, Profile
│       └── services/        # Axios (api.js, aiApi.js)
├── scripts/
│   └── generate-cfpa-mappings.cjs  # Builds cfpa-mappings.json (npm run generate:cfpa)
├── package.json             # Root: npm run dev (backend + frontend); npm run generate:cfpa
├── requirements.txt         # Runtime/tooling notes (not Python pip)
└── README.md
```

## Features (overview)

| Area | Description |
|------|-------------|
| **CFPA (branch-aware)** | Weighted blend: **skills 35%**, **interests 25%**, **branch 20%**, **academics 10%**, **projects 10%**; legacy mappings in `cfpa-mappings.json`; projection + branch priors in `branch-career-config.json`. Results include **branch label**, **why-branch fit**, **cross-branch suggestions**, confidence, and skill/interest breakdowns (per career title). |
| **Assessment** | **Engineering branch** (CSE, IT, ECE, EE, ME, CE, Chemical, Biotech, Aerospace, Mechatronics, Other), CGPA, 50+ skills, 50+ interests; branch-ordered categories and suggestions. |
| **Dashboard & results** | Branch badge, charts, ranked careers, confidence, retake / change branch. |
| **Career roadmap** | **POST /api/roadmap** with `career` + optional **`branch`**; rich steps from `BranchCareerMapping.json`, else `roadmaps.json`, else OpenAI (branch in prompt), else generic branch-aware steps. |
| **Career assistant (chat)** | **POST /api/chat** with optional **`branch`**, **`skills`**, **`interests`**, **`topCareer`**; OpenAI when configured (branch-aware system prompt), else rule-based branch guidance. |
| **Auth** | Register / login; JWT on protected routes; optional **PUT /api/profile/branch**. |

## Database

Hibernate **`spring.jpa.hibernate.ddl-auto=update`** creates/updates tables on startup:

| Table        | Purpose |
|-------------|---------|
| `users`     | `id`, `name`, `email` (optional, unique), `password` (BCrypt), **`branch`** (optional) |
| `user_inputs` | Assessment rows linked to `user_id`, including **`branch`** |
| `results`   | `career_scores` (JSON), `top_career`, `explanation`, **`metadata_json`** (confidence, breakdowns, branch fields, cross-branch list) |

Create an empty schema if you prefer:

```sql
CREATE DATABASE IF NOT EXISTS careermatrix CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## Prerequisites

- **JDK 17+**
- **Maven 3.8+** (optional if you use a Maven install under `backend/tools/` — see below)
- **Node.js 18+** and npm
- **MySQL 8+** running locally **or** use the **H2** dev profile (in-memory, no install) **or** **Docker** (see below)

## Run everything (one command)

From the **repository root** (`careermatrix/`):

**First time only** — install all dependencies (root + frontend workspace):

```bash
npm install
```

**Start the API and the web app together** (Spring Boot with **H2** + Vite):

```bash
npm run dev
```

(`npm start` does the same thing.)

- **API:** [http://localhost:8080](http://localhost:8080)
- **Web UI:** [http://localhost:5173](http://localhost:5173)

The launcher uses the **H2** profile by default so you do not need MySQL running. To use **MySQL** with the same command, ensure MySQL is up and credentials match `application.properties`, then:

**PowerShell**

```powershell
$env:CAREERMATRIX_USE_MYSQL="true"; npm run dev
```

**cmd.exe**

```cmd
set CAREERMATRIX_USE_MYSQL=true&& npm run dev
```

Press **Ctrl+C** once to stop both processes.

## Regenerating CFPA mappings

If you change **skill/interest labels** in `frontend/src/data/assessmentOptions.js` or edit weights in `scripts/generate-cfpa-mappings.cjs`, regenerate the backend JSON:

```bash
npm run generate:cfpa
```

This writes `backend/src/main/resources/cfpa-mappings.json`. Restart the Spring Boot app so the API loads the new file.

**Branch careers, priors, and rich chat/roadmap data** are edited in **`branch-career-config.json`** and **`BranchCareerMapping.json`** (no separate generator).

## Backend setup

1. Edit `backend/src/main/resources/application.properties`:
   - `spring.datasource.url` — host, port, database name
   - `spring.datasource.username` / `spring.datasource.password`
   - `app.jwt.secret` — use a long random secret in production (≥ 32 bytes for HS256)
   - **Optional AI:** `app.openai.api-key` — leave empty for rule-based chat and template roadmaps; set for OpenAI-powered chat and AI-generated roadmaps for unmatched careers (also configurable via `APP_OPENAI_API_KEY` in the environment).

2. From the `backend` folder:

```bash
mvn spring-boot:run
```

**If MySQL is not running yet:** either start MySQL and create the `careermatrix` database, or run with the **H2** profile (development only; data is not persisted across restarts):

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=h2
```

On Windows PowerShell you can use the helper (uses `mvn` from PATH, or `backend/tools/apache-maven-3.9.6/bin/mvn.cmd` if present):

```powershell
cd backend
.\run-backend.ps1 -Profile h2
```

**MySQL via Docker** (if Docker Desktop is installed):

```bash
docker compose up -d
```

Then use the default `application.properties` credentials (`root` / `root` — matches `docker-compose.yml`).

**Maven without a global install:** download the [Maven binary zip](https://maven.apache.org/download.cgi), extract to `backend/tools/apache-maven-3.9.6` (that folder is gitignored), then run `.\run-backend.ps1` or `.\tools\apache-maven-3.9.6\bin\mvn.cmd spring-boot:run`.

API base URL: `http://localhost:8080`

### REST endpoints

| Method | Path | Auth |
|--------|------|------|
| `POST` | `/api/register` | No |
| `POST` | `/api/login` | No |
| `POST` | `/api/chat` | No |
| `POST` | `/api/roadmap` | No |
| `POST` | `/api/predict-career` | Bearer JWT |
| `GET`  | `/api/results/{userId}` | Bearer JWT (must match user) |
| `PUT`  | `/api/profile/branch` | Bearer JWT |

**Register body:** `{ "name": "...", "password": "...", "email": "..." }` — `email` optional.

**Login body:** `{ "identifier": "email-or-name", "password": "..." }` — response may include **`branch`** if set.

**Predict body:** `{ "cgpa": number, "branch": "CSE", "technicalSkills": [...], "interests": [...], "projectExperience": "Beginner"|"Intermediate"|"Advanced", "certifications": "...", "preferredWorkType": "..." }` — **`branch`** required (codes such as `CSE`, `ME`, `CHE`, `BT`, `AE`, `MTR`, `OTHER`).

**Predict response (high level):** `topCareer`, `careerScores`, `rankedCareers`, `explanation`, **`branchCode`**, **`branchLabel`**, **`whyBranchFit`**, **`crossBranchSuggestions`**, **`confidencePercent`**, **`skillMatchBreakdown`**, **`interestMatchBreakdown`**.

**Chat body:** `{ "message": "...", "history": [ { "role": "user"|"assistant", "content": "..." } ], "branch": "...", "skills": [...], "interests": [...], "topCareer": "..." }` — only **`message`** required; others personalize replies.

**Roadmap body:** `{ "career": "Mechanical Design Engineer", "branch": "ME" }` — **`branch`** optional (defaults internally if omitted); response steps may include **`tools`**, **`projects`**, **`resources`**.

**Update branch body:** `{ "branch": "ECE" }` — authenticated user.

## Frontend setup

1. Optional: create `frontend/.env`:

```env
VITE_API_URL=http://localhost:8080
```

If omitted, the client defaults to `http://localhost:8080` (see `frontend/src/services/api.js`).

2. From the `frontend` folder:

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. The Vite dev server can proxy `/api` to the backend (see `vite.config.js`); the app still calls the backend URL directly by default for predictable CORS behavior.

**Production build:**

```bash
npm run build
```

Serve the `frontend/dist` folder with any static host; set `VITE_API_URL` to your deployed API URL when building.

## CFPA (high level)

- **Skill and interest signals** map through **`cfpa-mappings.json`** (five legacy buckets), then **project** into named career titles via **`branch-career-config.json`**.
- **Component weights:** skills **35%**, interests **25%**, **branch context 20%**, academic performance **10%**, project experience **10%**; scores are **normalized** so career percentages sum to **100%**.
- **Confidence** blends mapping coverage with fit to branch primary careers.
- **Optional** nudges: certifications; preferred work type string.
- **Persistence:** latest result stores scores plus **`metadata_json`** (confidence, breakdowns, branch fields) for history.

## Security notes

- Passwords are hashed with **BCrypt**.
- JWT is stored in **localStorage** (fine for learning demos; production apps often prefer httpOnly cookies).
- Change the JWT secret and DB credentials before any public deployment.
- Chat and roadmap endpoints are public by design; keep rate limits and API keys in mind if you expose the service widely.

## Troubleshooting

- **403/401 on API:** Ensure the backend is running and the `Authorization: Bearer <token>` header is sent after login for protected routes.
- **CORS errors:** Backend allows `http://localhost:5173`. Add your origin in `SecurityConfig` if you use another port.
- **MySQL connection refused:** Check service status, port `3306`, and credentials in `application.properties`.
- **AI features not using OpenAI:** Set `app.openai.api-key` in `application.properties` (or the corresponding environment variable) and restart the backend.
- **CFPA scores look off after renaming skills:** Run `npm run generate:cfpa` and restart the backend; keep `assessmentOptions.js` labels aligned with `cfpa-mappings.json`.
- **Unknown branch on predict:** Use a code defined in `branch-career-config.json` (see `frontend` engineering branch list).
