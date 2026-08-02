package com.tashin.train_booking_system.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.tashin.train_booking_system.dto.SeatResponse;
import com.tashin.train_booking_system.repository.SeatRepository;
import com.tashin.train_booking_system.repository.StationRepository;
import com.tashin.train_booking_system.entity.Station;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SeatService {

    private final SeatRepository seatRepository;
    private final StationRepository stationRepository;

    public List<SeatResponse> getAvailableSeats(Long originId, Long destinationId) {

        Station origin = stationRepository.findById(originId).orElseThrow();
        Station destination = stationRepository.findById(destinationId).orElseThrow();

        int originOrder = origin.getStationOrder();
        int destinationOrder = destination.getStationOrder();

        return seatRepository.findAvailableSeats(originOrder, destinationOrder)
                .stream()
                .map(s -> new SeatResponse(s.getId(), s.getSeatNumber()))
                .toList();

    }

}
