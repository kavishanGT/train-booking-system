package com.tashin.train_booking_system.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SeatResponse {

    private Long seatId;

    private String seatNumber;

}