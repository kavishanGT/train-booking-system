package com.tashin.train_booking_system.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tashin.train_booking_system.entity.Station;

@Repository
public interface StationRepository extends JpaRepository<Station, Long> {

    List<Station> findAllByOrderByStationOrderAsc();

}
