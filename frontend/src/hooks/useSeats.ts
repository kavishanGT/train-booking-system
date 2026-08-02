import { useQuery } from "@tanstack/react-query";
import { searchSeats } from "../api/seatApi";

export const useSeats = (origin: number | null, destination: number | null) => {
  return useQuery({
    queryKey: ["seats", origin, destination],
    queryFn: () => searchSeats(origin!, destination!),
    enabled: origin !== null && destination !== null,
  });
};
