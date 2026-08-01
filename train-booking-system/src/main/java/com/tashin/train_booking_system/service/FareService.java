package com.tashin.train_booking_system.service;

import java.math.BigDecimal;

import org.springframework.stereotype.Service;

@Service
public class FareService {

    private static final BigDecimal BASE_FARE = BigDecimal.valueOf(250);

    public BigDecimal calculateFare(

            int origin,

            int destination) {

        int distance = destination - origin;

        return BASE_FARE.multiply(
                BigDecimal.valueOf(distance));

    }

}
