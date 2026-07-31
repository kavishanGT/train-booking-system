package com.tashin.train_booking_system.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tashin.train_booking_system.entity.Coach;

@Repository
public interface CoachRepository extends JpaRepository<Coach, Long> {
}
