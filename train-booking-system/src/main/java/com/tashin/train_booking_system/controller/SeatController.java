package com.tashin.train_booking_system.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.tashin.train_booking_system.dto.SeatResponse;
import com.tashin.train_booking_system.service.SeatService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/seats")
@RequiredArgsConstructor
public class SeatController {

    private final SeatService seatService;

    @GetMapping
    public List<SeatResponse> getSeats() {

        return seatService.getAvailableSeats();

    }

}
