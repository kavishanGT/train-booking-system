package com.tashin.train_booking_system.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.tashin.train_booking_system.dto.StationResponse;
import com.tashin.train_booking_system.repository.StationRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class StationService {

    private final StationRepository stationRepository;

    public List<StationResponse> getStations() {

        return stationRepository.findAllByOrderByStationOrderAsc()

                .stream()

                .map(s -> new StationResponse(
                        s.getId(),
                        s.getName()))

                .toList();

    }

}
