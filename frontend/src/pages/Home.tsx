import { useState } from "react";
import { useStations } from "../hooks/useStations";
import { useSeats } from "../hooks/useSeats";
import { SeatCard } from "../components/SeatCard";
import { BookingModal } from "../components/BookingModal";
import { SuccessCard } from "../components/SuccessCard";
import type { Seat } from "../types/Seat";
import type { BookingSuccess } from "../types/Booking";

export const Home = () => {
  const [originId, setOriginId] = useState<number | null>(null);
  const [destinationId, setDestinationId] = useState<number | null>(null);
  const [searched, setSearched] = useState(false);

  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [bookingResult, setBookingResult] = useState<BookingSuccess | null>(null);

  // ── Data fetching ──────────────────────────────────────────────────
  const {
    data: stations = [],
    isLoading: stationsLoading,
    isError: stationsError,
  } = useStations();

  const {
    data: seats = [],
    isLoading: seatsLoading,
    isError: seatsError,
    refetch: refetchSeats,
  } = useSeats(searched ? originId : null, searched ? destinationId : null);

  // ── Derived values ─────────────────────────────────────────────────
  const originName =
    stations.find((s) => s.id === originId)?.name ?? "";
  const destinationName =
    stations.find((s) => s.id === destinationId)?.name ?? "";

  const availableStationsForDest = stations.filter(
    (s) => s.id !== originId
  );
  const availableStationsForOrigin = stations.filter(
    (s) => s.id !== destinationId
  );

  // ── Handlers ──────────────────────────────────────────────────────
  const handleSearch = () => {
    if (originId && destinationId) {
      setSearched(true);
      setBookingResult(null);
      refetchSeats();
    }
  };

  const handleBookingSuccess = (result: BookingSuccess) => {
    setSelectedSeat(null);
    setBookingResult(result);
    setSearched(false);
  };

  const handleReset = () => {
    setOriginId(null);
    setDestinationId(null);
    setSearched(false);
    setBookingResult(null);
    setSelectedSeat(null);
  };

  // ── Render: Success ────────────────────────────────────────────────
  if (bookingResult) {
    return (
      <div className="app-container">
        <SuccessCard booking={bookingResult} onReset={handleReset} />
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* ── Hero ── */}
      <div className="hero">
        <div className="hero-tag">🚂 Sri Lanka Railways</div>
        <h1>Train Booking System</h1>
        <p>Search for seats between stations and book your journey instantly.</p>
      </div>

      {/* ── Search Card ── */}
      <div className="search-card">
        <div className="search-grid">
          {/* Origin */}
          <div className="form-group">
            <label htmlFor="origin-select" className="form-label">
              📍 Origin
            </label>
            {stationsLoading ? (
              <select className="form-select" disabled>
                <option>Loading stations…</option>
              </select>
            ) : stationsError ? (
              <select className="form-select" disabled>
                <option>Failed to load</option>
              </select>
            ) : (
              <select
                id="origin-select"
                className="form-select"
                value={originId ?? ""}
                onChange={(e) => {
                  setOriginId(Number(e.target.value) || null);
                  setSearched(false);
                }}
              >
                <option value="">Select origin…</option>
                {availableStationsForOrigin.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Destination */}
          <div className="form-group">
            <label htmlFor="destination-select" className="form-label">
              🏁 Destination
            </label>
            {stationsLoading ? (
              <select className="form-select" disabled>
                <option>Loading stations…</option>
              </select>
            ) : stationsError ? (
              <select className="form-select" disabled>
                <option>Failed to load</option>
              </select>
            ) : (
              <select
                id="destination-select"
                className="form-select"
                value={destinationId ?? ""}
                onChange={(e) => {
                  setDestinationId(Number(e.target.value) || null);
                  setSearched(false);
                }}
                disabled={!originId}
              >
                <option value="">Select destination…</option>
                {availableStationsForDest.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Search Button */}
          <button
            id="search-seats-btn"
            className="btn btn-primary"
            onClick={handleSearch}
            disabled={!originId || !destinationId || stationsLoading}
          >
            🔍 Search Seats
          </button>
        </div>

        {/* Station load error */}
        {stationsError && (
          <div className="alert alert-error" style={{ marginTop: "1rem" }}>
            <span className="alert-icon">⚠️</span>
            <span>Unable to load stations. Is the backend running?</span>
          </div>
        )}
      </div>

      {/* ── Seat Section ── */}
      {!searched && (
        <div className="prompt-card">
          <div className="prompt-icon">🗺️</div>
          <p className="prompt-text">
            Select an origin and destination, then click{" "}
            <strong>Search Seats</strong> to view available seats.
          </p>
        </div>
      )}

      {searched && seatsLoading && (
        <div className="state-container">
          <div className="spinner" />
          <div className="state-title">Searching for seats…</div>
          <div className="state-desc">
            Finding available seats on this route
          </div>
        </div>
      )}

      {searched && seatsError && (
        <div className="state-container">
          <div className="state-icon">❌</div>
          <div className="state-title">Something went wrong.</div>
          <div className="state-desc">
            Could not load seats. Please try again.
          </div>
        </div>
      )}

      {searched && !seatsLoading && !seatsError && seats.length === 0 && (
        <div className="state-container">
          <div className="state-icon">😔</div>
          <div className="state-title">No seats available</div>
          <div className="state-desc">
            All seats on this route are currently booked.
          </div>
        </div>
      )}

      {searched && !seatsLoading && !seatsError && seats.length > 0 && (
        <>
          <div className="section-header">
            <div className="section-title">
              🪑 Available Seats
              <span className="seat-count-badge">{seats.length} seats</span>
            </div>
            <div className="legend">
              <div className="legend-item">
                <span className="legend-dot available" />
                Available
              </div>
              <div className="legend-item">
                <span className="legend-dot selected" />
                Selected
              </div>
            </div>
          </div>

          <div className="seat-grid">
            {seats.map((seat) => (
              <SeatCard
                key={seat.seatId}
                seat={seat}
                isSelected={selectedSeat?.seatId === seat.seatId}
                onClick={setSelectedSeat}
              />
            ))}
          </div>
        </>
      )}

      {/* ── Booking Modal ── */}
      {selectedSeat && originId && destinationId && (
        <BookingModal
          seat={selectedSeat}
          originId={originId}
          destinationId={destinationId}
          originName={originName}
          destinationName={destinationName}
          onClose={() => setSelectedSeat(null)}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
};
