package com.tashin.train_booking_system.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.tashin.train_booking_system.dto.SeatResponse;
import com.tashin.train_booking_system.repository.SeatRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SeatService {

    private final SeatRepository seatRepository;

    public List<SeatResponse> getAvailableSeats() {

        return seatRepository.findAll()

                .stream()

                .map(s -> new SeatResponse(
                        s.getId(),
                        s.getSeatNumber()))

                .toList();

    }

}
