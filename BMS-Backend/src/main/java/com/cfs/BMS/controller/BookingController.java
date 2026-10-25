package com.cfs.BMS.controller;

import com.cfs.BMS.dto.BookingRequest;
import com.cfs.BMS.dto.BookingResponse;
import com.cfs.BMS.entity.Booking;
import com.cfs.BMS.entity.Seat;
import com.cfs.BMS.entity.Show;
import com.cfs.BMS.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(@RequestBody BookingRequest request) {
        return ResponseEntity.ok(toResponse(bookingService.createBooking(request)));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<BookingResponse>> getBookingUser(@PathVariable Long userId) {
        return ResponseEntity.ok(
                bookingService.getBookingByUser(userId).stream().map(this::toResponse).toList());
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<BookingResponse> cancelBooking(@PathVariable Long id) {
        return ResponseEntity.ok(toResponse(bookingService.cancelBooking(id)));
    }

    private BookingResponse toResponse(Booking b) {
        Show sh = b.getShow();
        List<String> seats = b.getSeats() == null ? List.of()
                : b.getSeats().stream().map(Seat::getSeatNumber).toList();
        return new BookingResponse(
                b.getId(),
                b.getStatus() == null ? null : b.getStatus().name(),
                b.getTotalPrice(),
                b.getBookedAt(),
                sh.getId(),
                sh.getMovie().getTitle(),
                sh.getScreen().getTheatre().getName(),
                sh.getScreen().getName(),
                sh.getStartTime(),
                seats);
    }
}