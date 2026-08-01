package com.tashin.train_booking_system.exception;

import java.util.NoSuchElementException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<String> handleNotFound() {

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body("Resource Not Found");

    }

    @ExceptionHandler(BookingConflictException.class)
    public ResponseEntity<String> handleConflict(
            BookingConflictException ex) {

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(ex.getMessage());

    }

}
