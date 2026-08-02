# 🚆 Train Booking System

A full-stack train seat booking application for the Sri Lankan railway network, built with **Spring Boot** and **React**. Passengers can search for available seats between stations along the Colombo–Badulla main line and book them in real time, with segment-aware conflict detection and automatic fare calculation.

---

## 📸 Preview

| Home — Search | Seat Map | Booking Modal | Success |
|---|---|---|---|
| Select origin & destination | Browse 🟩 available / 🟦 selected seats | Enter passenger name & confirm | Seat, route, and fare |

---

## 🏗️ Project Structure

```
train-booking-system/
├── docker-compose.yml
├── frontend/                     # React + Vite (TypeScript)
│   ├── Dockerfile
│   ├── nginx.conf
│   └── src/
│       ├── api/                  # Axios clients per resource
│       ├── components/           # SeatCard, BookingModal, SuccessCard
│       ├── hooks/                # useStations, useSeats (React Query)
│       ├── pages/                # Home page
│       └── types/                # TypeScript interfaces
└── train-booking-system/         # Spring Boot backend
    ├── Dockerfile
    └── src/main/java/.../
        ├── config/               # SecurityConfig, CorsConfig
        ├── controller/           # REST controllers
        ├── dto/                  # Request / Response DTOs
        ├── entity/               # JPA entities
        ├── exception/            # BookingConflictException
        ├── repository/           # Spring Data JPA repositories
        └── service/              # BookingService, FareService, …
```

---

## 🎯 Core Design Decisions

### 1. Segment-Based Seat Availability

**Decision:** A seat is marked unavailable only if an existing booking on that seat covers a route segment that *overlaps* with the requested one. Two segments `[A, B]` and `[C, D]` overlap when `A < D AND B > C`.

**Why:** Real trains re-use the same physical seat across multiple trips. A passenger travelling Colombo → Kandy (stops 0–3) vacates the seat at Kandy, so the same seat should be bookable for Kandy → Badulla (stops 3–9). A naïve boolean `isBooked` flag on the seat itself would prevent this.

**Alternative considered:** Storing a per-station-stop booking grid (one row per seat per stop). This gives finer granularity but adds significant complexity — N×S rows instead of one booking row — and wasn't necessary for a linear single-track line.

---

### 2. `station_order` as a Linear Integer Key

**Decision:** Each station has a `station_order INT UNIQUE` column representing its sequential position along the line (0 = Colombo Fort, 9 = Badulla).

**Why:** The overlap formula requires only integer comparison (`<`, `>`). Using the database primary key (`id`) for ordering would work too, but auto-generated IDs are not guaranteed to be sequential or meaningful. A dedicated `station_order` column makes intent explicit and is safe to query against.

**Alternative considered:** GPS coordinates with a distance calculation. Over-engineered for a single-line system where station order is entirely deterministic.

---

### 3. Flyway for Database Migrations

**Decision:** All schema changes and seed data are managed with Flyway versioned migration scripts (`V1__initial_schema.sql`, `V2__seed_data.sql`).

**Why:** Hibernate's `ddl-auto: create` or `update` is convenient during development but dangerous in shared and production environments — it can silently drop or alter tables. Flyway gives an explicit, auditable, repeatable migration history.

**Alternative considered:** Liquibase (also popular). Flyway was chosen for its simplicity — plain SQL scripts with no XML/YAML DSL overhead.

---

### 4. Spring Data JPA with a Custom JPQL Query

**Decision:** Seat availability is computed with a single JPQL query in `SeatRepository`:

```java
SELECT s FROM Seat s
WHERE s.id NOT IN (
    SELECT b.seat.id FROM Booking b
    WHERE b.originStation.stationOrder  < :destOrder
      AND b.destinationStation.stationOrder > :originOrder
)
```

**Why:** Pushing the filtering into a single database query is more efficient than fetching all seats and all bookings into memory and filtering in Java. JPA's query translation also ensures portability across databases.

**Alternative considered:** A native SQL query. JPQL was preferred to keep the code database-agnostic and aligned with the JPA entity model. A native query would have been used only if performance profiling demanded it.

---

### 5. React Query for Server State

**Decision:** All API calls are managed with **TanStack React Query** (`useQuery`, `useMutation`) instead of raw `useEffect` + `useState`.

**Why:** React Query handles caching, background refetching, loading/error states, and request deduplication automatically. The `enabled` option on `useSeats` means the query only fires when both origin and destination are selected — no manual guards needed. `useMutation` gives a clean pending/error/success lifecycle for the booking POST.

**Alternative considered:**
- **Redux Toolkit Query** — More setup for a small app. Overkill here.
- **`useEffect` + `fetch`** — Would require re-implementing caching, race-condition guards, and loading/error state manually in every component.
- **SWR** — Similar to React Query but less feature-rich (no mutation management).

---

### 6. Vite Dev Proxy Instead of CORS Headers

**Decision:** During development, the Vite server proxies all `/api/*` requests to `http://localhost:8080`, meaning the browser never makes a cross-origin request.

**Why:** CORS configuration is server-side boilerplate that needs maintenance. The proxy keeps the development environment identical in structure to the production Docker setup (where Nginx handles the same `/api` proxying) — no mental model switch between environments.

**Alternative considered:** Adding `@CrossOrigin` to every controller. Discarded because it scatters configuration across many files and is easy to forget on new controllers.

---

### 7. Multi-Stage Docker Builds

**Decision:** Both Dockerfiles use a two-stage build — the first stage compiles (Maven/Node), the second stage is a minimal runtime image (JRE/Nginx).

**Why:** The final images contain only what is needed at runtime. The backend JDK image is ~600 MB; the JRE-only image is ~200 MB. The Node image is ~500 MB; the Nginx Alpine image is ~25 MB. This reduces image size, attack surface, and pull time.

**Alternative considered:** Committing a pre-built JAR to the repository and using a single-stage Dockerfile (`COPY target/*.jar`). Discarded because it couples repository state to build artifacts and prevents clean builds from source.

---

### 8. Nginx as the Production Frontend Server

**Decision:** The React app is served by **Nginx** in production (Docker), not a Node.js server.

**Why:** Nginx is purpose-built for serving static files and proxying — it's significantly faster than `node serve` or `vite preview` for production workloads and has near-zero memory overhead.

The `nginx.conf` also handles:
- **SPA fallback** (`try_files $uri /index.html`) so React Router works on direct URL access.
- **`/api` proxy** to the backend container, mirroring the Vite dev proxy.
- **Static asset caching** (`Cache-Control: immutable, 1y`) so browsers never re-download unchanged JS/CSS bundles.

---

### 9. FareService — Distance-Based Pricing

**Decision:** `FareService` calculates fare as `Rs 250 × (destinationOrder − originOrder)`.

**Why:** Simple, auditable, and reproducible from only the two station IDs. The result is stored in the `booking.price` column so historical fares are preserved even if the pricing formula changes later.

**Alternative considered:** A fare lookup table (origin × destination matrix). More flexible, but adds a database table and admin tooling for a prototype where flat-rate pricing per stop is sufficient.

---

## ⚠️ Challenges Faced

### Challenge 1: Spring Security Blocking All Requests (401)

**Problem:** The project included `spring-boot-starter-security` as a dependency. Spring Boot's auto-configuration immediately locks down all endpoints behind HTTP Basic auth, returning `401 Unauthorized` to the frontend with no visible error in the code.

**Root cause:** Security was added to the pom as a future scaffold, but no `SecurityFilterChain` bean was defined, so Spring fell back to its default deny-all policy.

**Fix:** Created [`SecurityConfig.java`](train-booking-system/src/main/java/com/tashin/train_booking_system/config/SecurityConfig.java) that explicitly permits all routes and disables CSRF (stateless REST API):

```java
http.csrf(AbstractHttpConfigurer::disable)
    .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
```

---

### Challenge 2: Stale Compiled Classes with Spring DevTools

**Problem:** After fixing `SeatRepository.java` to add `findAvailableSeats`, the running server continued throwing `Unresolved compilation problem: The method findAvailableSeats(int, int) is undefined`. The source was correct but the JVM was still loading the old `.class` file.

**Root cause:** Spring DevTools performs incremental hot-reloading. When a single file changes, DevTools recompiles only the changed file and restarts the application classloader. However, if the previous compile had failed for a different file, some `.class` files in `target/` were inconsistent — the new `SeatService.class` referenced a method that didn't exist in the old `SeatRepository.class`.

**Fix:** Running `mvn clean compile` deleted the entire `target/classes/` directory and rebuilt all 24 source files from scratch, resulting in a consistent, error-free compiled state.

---

### Challenge 3: JSX Parsing Error — `Operator '>' cannot be applied`

**Problem:** TypeScript reported: `Operator '>' cannot be applied to types '{ client: QueryClient; }' and 'Element'` on the `<QueryClientProvider>` JSX tag.

**Root cause:** JSX tags placed *outside* any function or `render()` call are parsed by TypeScript as generic type comparisons, not JSX. The `<QueryClientProvider>` and `</QueryClientProvider>` tags had been written at the module top level rather than inside the `createRoot().render()` call.

**Fix:** Moved all JSX into the `.render()` call and wrapped `<App/>` inside `<QueryClientProvider>` correctly.

---

### Challenge 4: `SeatService.getAvailableSeats()` Signature Mismatch

**Problem:** The `SeatController` called `seatService.getAvailableSeats(origin, destination)` with two `Long` parameters, but `SeatService.getAvailableSeats()` was declared with no parameters — a compile-time mismatch that only surfaced at restart because the original server had been running for 42+ hours with the old, working version of that code.

**Fix:** Updated `SeatService.getAvailableSeats(Long originId, Long destinationId)` to accept the IDs, resolve station orders via `StationRepository`, and delegate to the new JPQL query.

---

### Challenge 5: Docker — Backend Starts Before Postgres Is Ready

**Problem:** Without explicit startup ordering, the Spring Boot container can start before PostgreSQL is ready to accept connections. Flyway fails immediately because the JDBC pool can't connect, crashing the container.

**Fix:** Added a `healthcheck` to the `postgres` service and used `depends_on: condition: service_healthy` on the backend service:

```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U postgres -d bookingtrain"]
  interval: 10s
  retries: 5
```

This causes Docker Compose to wait until `pg_isready` returns success before starting the Spring Boot container.

---

## 🌟 Extra Credit Features

### 1. ✅ Segment-Aware Seat Availability (Beyond a Simple Boolean)

The most significant extra feature: seats are not globally "booked" or "free" — they are available per route segment. The JPQL overlap query enables this without any application-layer looping. A seat can be booked simultaneously by multiple passengers on non-overlapping portions of the same train journey.

---

### 2. 💰 Automatic Fare Calculation & Persistence

`FareService` calculates fare at booking time based on the number of station stops and stores it in `booking.price`. This means:
- Fare is shown on the success screen to the user.
- Historical pricing is preserved in the DB even if rates change.
- The calculation is fully server-side (tamper-proof).

---

### 3. 🎨 Premium Dark-Mode UI

The frontend goes beyond a functional interface:
- Full dark-mode design with CSS custom properties (HSL colour tokens, glass-morphism cards, gradient hero).
- Smooth micro-animations — seat cards lift on hover, modals slide in, buttons show glow effects.
- Inter font via Google Fonts, responsive grid layout, custom scrollbar and select arrow styling.
- The design system is defined entirely in `index.css` with reusable classes — no inline styles.

---

### 4. 🐳 Full Docker Containerisation

The entire application — frontend, backend, and database — can be started with one command from a clean machine with no local dependencies other than Docker:

```bash
docker compose up --build
```

This includes:
- Multi-stage builds for both the backend (Maven → JRE) and frontend (Node → Nginx Alpine).
- Health-check-gated startup ordering.
- A named Docker volume for Postgres data persistence across container restarts.
- Environment variable overrides for DB connection without editing source files.

---

### 5. 🔄 React Query with Conditional Fetching

The `useSeats` hook uses `enabled: origin !== null && destination !== null` so the seat API is never called until both dropdowns are filled. When either dropdown changes, React Query automatically invalidates and re-fetches — no manual `useEffect` cleanup required. The `queryKey: ["seats", origin, destination]` ensures each unique route pair has its own cache entry.

---

## 🛠️ Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Java | 21 | Language |
| Spring Boot | 4.1.0 | Application framework |
| Spring Web MVC | — | REST API |
| Spring Data JPA | — | ORM / repositories |
| Spring Security | 7.1.0 | Security configuration |
| Flyway | — | Database migrations |
| PostgreSQL | 18 | Relational database |
| Lombok | — | Boilerplate reduction |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| TypeScript | 6 | Type safety |
| Vite | 8 | Build tool + dev proxy |
| TanStack React Query | 5 | Server state management |
| Axios | 1.19 | HTTP client |
| Tailwind CSS | 4 | Utility CSS |

---

## 🗄️ Database Schema

```sql
station  (id, name, station_order)
coach    (id, coach_number, coach_type)
seat     (id, coach_id → coach, seat_number)
booking  (id, seat_id → seat, origin_station → station,
          destination_station → station, passenger_name,
          price, booking_time, status)
```

### Seeded Data (Colombo–Badulla Line)

| Order | Station |
|---|---|
| 0 | Colombo Fort |
| 1 | Polgahawela |
| 2 | Peradeniya |
| 3 | Kandy |
| 4 | Nawalapitiya |
| 5 | Hatton |
| 6 | Nanu Oya |
| 7 | Haputale |
| 8 | Ella |
| 9 | Badulla |

| Coach | Type | Seats |
|---|---|---|
| R1 | RESERVED | A1, A2, A3, A4 |
| R2 | RESERVED | A1, A2, A3 |
| R3 | RESERVED | A1, A2 |

---

## 🚀 Getting Started (Local)

### Prerequisites
- Java 21+, Maven 3.9+, Node.js 20+, PostgreSQL 15+

```sql
-- Create the database
CREATE DATABASE bookingtrain;
```

```yaml
# application.yaml — update credentials
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/bookingtrain
    username: your_username
    password: your_password
```

```bash
# Terminal 1 — backend (Flyway seeds data automatically)
cd train-booking-system
mvn spring-boot:run

# Terminal 2 — frontend
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**

---

## 🐳 Getting Started (Docker)

```bash
# From project root — builds and starts all 3 containers
docker compose up --build
```

| URL | Service |
|---|---|
| http://localhost:3000 | React frontend |
| http://localhost:8080/api/stations | Spring Boot API |

```bash
docker compose down        # Stop containers
docker compose down -v     # Stop + delete DB volume
docker compose logs -f     # Live logs
```

---

## 🔌 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/stations` | All stations ordered by route position |
| `GET` | `/api/seats?origin={id}&destination={id}` | Available seats for a route segment |
| `POST` | `/api/bookings` | Create a booking |
| `GET` | `/api/health` | Health check |

```json
// POST /api/bookings
{
  "seatId": 1,
  "originStationId": 1,
  "destinationStationId": 4,
  "passengerName": "Tashin Kavishan"
}
```

| Status | Meaning |
|---|---|
| `200 OK` | Booking created |
| `409 Conflict` | Seat already booked on an overlapping segment |
| `400 Bad Request` | Missing required parameters |

---

## 🧑‍💻 Author

**Tashin Kavishan**