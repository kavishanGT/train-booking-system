import api from "./api";
import type { Seat } from "../types/Seat";

export const searchSeats = async (
  origin: number,
  destination: number
): Promise<Seat[]> => {
  const response = await api.get("/seats", {
    params: { origin, destination },
  });
  return response.data;
};
