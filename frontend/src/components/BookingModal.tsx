import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { createBooking } from "../api/bookingApi";
import type { Seat } from "../types/Seat";
import type { BookingSuccess } from "../types/Booking";

interface BookingModalProps {
  seat: Seat;
  originId: number;
  destinationId: number;
  originName: string;
  destinationName: string;
  onClose: () => void;
  onSuccess: (result: BookingSuccess) => void;
}

export const BookingModal = ({
  seat,
  originId,
  destinationId,
  originName,
  destinationName,
  onClose,
  onSuccess,
}: BookingModalProps) => {
  const [passengerName, setPassengerName] = useState("");
  const [conflictError, setConflictError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      createBooking({
        seatId: seat.seatId,
        originStationId: originId,
        destinationStationId: destinationId,
        passengerName: passengerName.trim(),
      }),
    onSuccess: () => {
      // Calculate a simple fare based on seat number
      const fare = 500 + (seat.seatId % 5) * 50;
      onSuccess({
        seatNumber: seat.seatNumber,
        originName,
        destinationName,
        fare,
      });
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        setConflictError(
          "Seat already booked. Please choose another seat."
        );
      } else {
        setConflictError("Something went wrong. Please try again.");
      }
    },
  });

  const handleConfirm = () => {
    if (!passengerName.trim()) return;
    setConflictError(null);
    mutation.mutate();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Confirm Booking</span>
          <button
            id="modal-close-btn"
            className="modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Seat Info */}
        <div className="modal-seat-info">
          <span className="modal-seat-icon">🪑</span>
          <div>
            <div className="modal-seat-label">Selected Seat</div>
            <div className="modal-seat-number">{seat.seatNumber}</div>
          </div>
          <div style={{ marginLeft: "auto", textAlign: "right" }}>
            <div className="modal-seat-label">Route</div>
            <div
              className="modal-seat-number"
              style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}
            >
              {originName} → {destinationName}
            </div>
          </div>
        </div>

        {/* Conflict / Error Alert */}
        {conflictError && (
          <div className="alert alert-error">
            <span className="alert-icon">⚠️</span>
            <span>{conflictError}</span>
          </div>
        )}

        {/* Passenger Name Input */}
        <label
          htmlFor="passenger-name"
          className="form-label"
          style={{ display: "block", marginBottom: "0.5rem" }}
        >
          Passenger Name
        </label>
        <input
          id="passenger-name"
          type="text"
          className="form-input"
          placeholder="Enter full name"
          value={passengerName}
          onChange={(e) => setPassengerName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
          disabled={mutation.isPending}
          autoFocus
        />

        <div className="modal-actions">
          <button
            id="modal-cancel-btn"
            className="btn btn-ghost"
            onClick={onClose}
            disabled={mutation.isPending}
          >
            Cancel
          </button>
          <button
            id="modal-confirm-btn"
            className="btn btn-success"
            onClick={handleConfirm}
            disabled={!passengerName.trim() || mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                <span
                  style={{
                    width: 16,
                    height: 16,
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "#fff",
                    borderRadius: "50%",
                    display: "inline-block",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
                Booking…
              </>
            ) : (
              "Confirm"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
