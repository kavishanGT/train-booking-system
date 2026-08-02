import type { Seat } from "../types/Seat";

interface SeatCardProps {
  seat: Seat;
  isSelected: boolean;
  onClick: (seat: Seat) => void;
}

export const SeatCard = ({ seat, isSelected, onClick }: SeatCardProps) => {
  const status = isSelected ? "selected" : "available";

  return (
    <div
      id={`seat-${seat.seatId}`}
      className={`seat-card ${status}`}
      onClick={() => onClick(seat)}
      role="button"
      aria-pressed={isSelected}
      aria-label={`Seat ${seat.seatNumber}, ${status}`}
    >
      <span className="seat-emoji">
        {isSelected ? "🟦" : "🟩"}
      </span>
      <span className="seat-number">{seat.seatNumber}</span>
    </div>
  );
};
