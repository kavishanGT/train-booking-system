import { useQuery } from "@tanstack/react-query";
import { getStations } from "../api/stationApi";

export const useStations = () => {
  return useQuery({
    queryKey: ["stations"],
    queryFn: getStations,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
