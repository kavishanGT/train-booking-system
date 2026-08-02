import api from "./api";

export const getStations = async () => {

    const response =

        await api.get("/stations");

    return response.data;

}