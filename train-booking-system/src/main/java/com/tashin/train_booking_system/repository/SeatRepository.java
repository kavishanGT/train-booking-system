package com.tashin.train_booking_system.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.tashin.train_booking_system.entity.Seat;

@Repository
public interface SeatRepository extends JpaRepository<Seat, Long> {

    /**
     * Returns all seats NOT already booked on a segment overlapping
     * [originOrder, destOrder]. Two segments overlap when:
     *   newOrigin < existingDestination AND newDestination > existingOrigin
     */
    @Query("""
        SELECT s FROM Seat s
        WHERE s.id NOT IN (
            SELECT b.seat.id FROM Booking b
            WHERE b.originStation.stationOrder  < :destOrder
              AND b.destinationStation.stationOrder > :originOrder
        )
    """)
    List<Seat> findAvailableSeats(
            @Param("originOrder") int originOrder,
            @Param("destOrder") int destOrder);
}
