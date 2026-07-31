package com.tashin.train_booking_system.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.tashin.train_booking_system.dto.StationResponse;
import com.tashin.train_booking_system.service.StationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/stations")
@RequiredArgsConstructor
public class StationController {

    private final StationService stationService;

    @GetMapping
    public List<StationResponse> getStations() {

        return stationService.getStations();

    }

}
