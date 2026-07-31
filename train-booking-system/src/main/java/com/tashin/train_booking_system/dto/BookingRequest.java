package com.tashin.train_booking_system.dto;

import lombok.Data;

@Data
public class BookingRequest {

    private Long seatId;

    private Long originStationId;

    private Long destinationStationId;

    private String passengerName;

}
