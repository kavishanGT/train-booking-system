import type { BookingSuccess } from "../types/Booking";

interface SuccessCardProps {
  booking: BookingSuccess;
  onReset: () => void;
}

export const SuccessCard = ({ booking, onReset }: SuccessCardProps) => {
  return (
    <div className="success-card">
      <div className="success-check">✅</div>
      <h2 className="success-title">Booking Successful!</h2>
      <p className="success-subtitle">
        Your seat has been reserved. Have a great journey!
      </p>

      <div className="success-details">
        <div className="success-detail-row">
          <span className="success-detail-label">Seat</span>
          <span className="success-detail-value">{booking.seatNumber}</span>
        </div>
        <div className="success-detail-row">
          <span className="success-detail-label">Route</span>
          <span className="success-detail-value">
            <span className="route-display">
              {booking.originName}
              <span className="route-arrow">→</span>
              {booking.destinationName}
            </span>
          </span>
        </div>
        <div
          className="success-detail-row"
          style={{ borderTop: "1px solid var(--border)", paddingTop: "0.75rem" }}
        >
          <span className="success-detail-label">Fare</span>
          <span className="success-detail-value highlight">
            Rs {booking.fare.toLocaleString()}
          </span>
        </div>
      </div>

      <button id="book-another-btn" className="btn btn-primary" onClick={onReset}>
        🎫 Book Another Ticket
      </button>
    </div>
  );
};
