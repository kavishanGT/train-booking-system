package com.tashin.train_booking_system.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "coach")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Coach {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String coachNumber;

    @Column(nullable = false)
    private String coachType;

}
