package com.tashin.train_booking_system.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.tashin.train_booking_system.dto.BookingRequest;
import com.tashin.train_booking_system.service.BookingService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<Void> createBooking(
            @RequestBody BookingRequest request) {

        bookingService.createBooking(request);

        return ResponseEntity.ok().build();

    }

}
