import api from "./api";
import type { BookingRequest } from "../types/Booking";

export const createBooking = async (booking: BookingRequest): Promise<void> => {
  await api.post("/bookings", booking);
};
