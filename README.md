# 🚆 Train Booking System

A full-stack train seat booking application built with **Spring Boot** and **React**, allowing passengers to search for available seats between Sri Lankan railway stations and book them in real time.

---

## 📸 Preview

| Home — Search |  Seat Map | Booking Modal | Success |
|---|---|---|---|
| Select origin & destination stations | Browse available 🟩 / selected 🟦 seats | Enter passenger name & confirm | Booking details + fare |

---

## 🏗️ Project Structure

```
train-booking-system/
├── frontend/                   # React + Vite frontend
│   └── src/
│       ├── api/                # Axios API clients
│       ├── components/         # SeatCard, BookingModal, SuccessCard
│       ├── hooks/              # useStations, useSeats (React Query)
│       ├── pages/              # Home page
│       └── types/              # TypeScript interfaces
└── train-booking-system/       # Spring Boot backend
    └── src/main/java/.../
        ├── config/             # CorsConfig, SecurityConfig
        ├── controller/         # REST controllers
        ├── dto/                # Request/Response DTOs
        ├── entity/             # JPA entities
        ├── exception/          # BookingConflictException
        ├── repository/         # Spring Data JPA repositories
        └── service/            # Business logic + FareService
```

---

## ✨ Features

- 🗺️ **Station selection** — dropdown menus for origin & destination (10 stations on the Colombo–Badulla main line)
- 🪑 **Seat availability** — only shows seats not already booked on overlapping route segments
- 🟩 **Visual seat map** — green (available) / blue (selected) seat tiles
- 📋 **Booking modal** — passenger name input with real-time validation
- ✅ **Success screen** — displays seat number, route, and calculated fare
- ⚠️ **Conflict handling** — 409 responses shown as "Seat already booked" message
- 🔄 **Loading & error states** — spinner, error banner, and empty-seat message
- 📱 **Responsive layout** — works on desktop and mobile

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
| PostgreSQL | 18 | Database |
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

### Seeded Stations (Colombo–Badulla Line)

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

### Seeded Coaches & Seats

| Coach | Type | Seats |
|---|---|---|
| R1 | RESERVED | A1, A2, A3, A4 |
| R2 | RESERVED | A1, A2, A3 |
| R3 | RESERVED | A1, A2 |

---

## 🚀 Getting Started

### Prerequisites

- Java 21+
- Maven 3.9+
- Node.js 20+
- PostgreSQL 15+

---

### 1. Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE bookingtrain;
```

---

### 2. Backend Setup

Update `application.yaml` with your PostgreSQL credentials:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/bookingtrain
    username: your_username
    password: your_password
```

Run the backend (Flyway will auto-create tables and seed data):

```bash
cd train-booking-system
mvn spring-boot:run
```

The API will be available at: **http://localhost:8080**

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app will be available at: **http://localhost:5173**

> The Vite dev server proxies all `/api/*` requests to `http://localhost:8080` — no CORS configuration needed.

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/stations` | List all stations ordered by route position |
| `GET` | `/api/seats?origin={id}&destination={id}` | Get available seats for a route segment |
| `POST` | `/api/bookings` | Create a new booking |
| `GET` | `/api/health` | Health check |

### POST `/api/bookings` — Request Body

```json
{
  "seatId": 1,
  "originStationId": 1,
  "destinationStationId": 4,
  "passengerName": "Tashin Kavishan"
}
```

### Error Responses

| Status | Meaning |
|---|---|
| `409 Conflict` | Seat is already booked on an overlapping segment |
| `400 Bad Request` | Missing or invalid request parameters |

---

## 💡 Booking Logic

Seats are considered **unavailable** if an existing booking's route segment **overlaps** with the requested segment.

Two segments `[A, B]` and `[C, D]` overlap when:
```
A < D  AND  B > C
```

This means a seat booked from **Colombo → Kandy** (0→3) will still appear available for **Kandy → Badulla** (3→9) since the segments don't overlap.

---

## 💰 Fare Calculation

Fare is calculated by the `FareService` based on the number of station stops:

```
Fare = Rs 250 × (destination_order − origin_order)
```

**Example:** Colombo Fort (0) → Kandy (3) = Rs 250 × 3 = **Rs 750**

---

## 📁 Key Source Files

### Backend
- [`BookingService.java`](train-booking-system/src/main/java/com/tashin/train_booking_system/service/BookingService.java) — Core booking logic with conflict detection
- [`SeatRepository.java`](train-booking-system/src/main/java/com/tashin/train_booking_system/repository/SeatRepository.java) — JPQL query for available seats
- [`FareService.java`](train-booking-system/src/main/java/com/tashin/train_booking_system/service/FareService.java) — Fare calculation
- [`SecurityConfig.java`](train-booking-system/src/main/java/com/tashin/train_booking_system/config/SecurityConfig.java) — Open access configuration
- [`CorsConfig.java`](train-booking-system/src/main/java/com/tashin/train_booking_system/config/CorsConfig.java) — CORS for frontend origin

### Frontend
- [`pages/Home.tsx`](frontend/src/pages/Home.tsx) — Main booking page
- [`components/BookingModal.tsx`](frontend/src/components/BookingModal.tsx) — Booking form + 409 error handling
- [`components/SeatCard.tsx`](frontend/src/components/SeatCard.tsx) — Individual seat tile
- [`hooks/useSeats.ts`](frontend/src/hooks/useSeats.ts) — React Query hook for seat search
- [`vite.config.ts`](frontend/vite.config.ts) — Dev proxy configuration

---

## 🧑‍💻 Author

**Tashin Kavishan**