package com.tashin.train_booking_system.service;

import org.springframework.stereotype.Service;

import com.tashin.train_booking_system.dto.BookingRequest;
import com.tashin.train_booking_system.entity.Booking;
import com.tashin.train_booking_system.entity.Seat;
import com.tashin.train_booking_system.entity.Station;
import com.tashin.train_booking_system.exception.BookingConflictException;
import com.tashin.train_booking_system.repository.BookingRepository;
import com.tashin.train_booking_system.repository.SeatRepository;
import com.tashin.train_booking_system.repository.StationRepository;

import lombok.RequiredArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import jakarta.transaction.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;

    private final SeatRepository seatRepository;

    private final StationRepository stationRepository;
    private final FareService fareService;

    private boolean overlap(

            int newOrigin,

            int newDestination,

            int existingOrigin,

            int existingDestination) {

        return

        newOrigin < existingDestination

                &&

                newDestination > existingOrigin;

    }

    @Transactional
    public void createBooking(BookingRequest request) {

        Seat seat = seatRepository.findById(request.getSeatId())

                .orElseThrow();

        Station origin = stationRepository.findById(
                request.getOriginStationId()).orElseThrow();

        Station destination = stationRepository.findById(
                request.getDestinationStationId()).orElseThrow();

        List<Booking> existing = bookingRepository.findBySeatId(request.getSeatId());

        for (Booking b : existing) {
            if (overlap(
                    origin.getStationOrder(),
                    destination.getStationOrder(),

                    b.getOriginStation()
                            .getStationOrder(),

                    b.getDestinationStation()
                            .getStationOrder()

            )) {

                throw new BookingConflictException(
                        "Seat already booked.");

            }
        }

        BigDecimal price = fareService.calculateFare(
                origin.getStationOrder(),
                destination.getStationOrder());

        Booking booking = Booking.builder()

                .seat(seat)

                .originStation(origin)

                .destinationStation(destination)

                .passengerName(request.getPassengerName())

                .bookingTime(LocalDateTime.now())

                .status("CONFIRMED")

                .price(price)

                .build();

        bookingRepository.save(booking);

    }

}
