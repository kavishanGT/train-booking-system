package com.tashin.train_booking_system.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "station")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Station {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "station_order", nullable = false, unique = true)
    private Integer stationOrder;

}
