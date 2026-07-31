package com.tashin.train_booking_system.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "booking")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "seat_id")
    private Seat seat;

    @ManyToOne
    @JoinColumn(name = "origin_station")
    private Station originStation;

    @ManyToOne
    @JoinColumn(name = "destination_station")
    private Station destinationStation;

    private String passengerName;

    private BigDecimal price;

    private LocalDateTime bookingTime;

    private String status;

}
