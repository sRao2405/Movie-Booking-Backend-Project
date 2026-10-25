package com.cfs.BMS.controller;

import com.cfs.BMS.entity.Show;
import com.cfs.BMS.enums.SeatType;
import com.cfs.BMS.repository.BookingRepository;
import com.cfs.BMS.repository.SeatRepository;
import com.cfs.BMS.repository.ShowRepository;
import com.cfs.BMS.service.ShowService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/shows")
@RequiredArgsConstructor
public class ShowController {

    private final ShowService showService;
    private final BookingRepository bookingRepo;
    private final ShowRepository showRepository;// new
    private final SeatRepository seatRepository;


    @GetMapping
    public ResponseEntity<List<Show>> getAllShows()
    {
        return ResponseEntity.ok(showService.getAllShow());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Show> getShowById(@PathVariable Long id)
    {
        return ResponseEntity.ok(showService.getShowById(id));
    }

    @GetMapping("{id}/booked-seat-ids")
    public ResponseEntity<List<Long>> getBookedSeatIds(@PathVariable Long id)
    {
        return ResponseEntity.ok(bookingRepo.findBookedSeatIdByShowId(id));
    }

    @GetMapping("/movie/{movieId}")
    public ResponseEntity<List<Show>> getShowByMovie(@PathVariable Long movieId)
    {
        return ResponseEntity.ok(showService.getShowByMovie(movieId));
    }

    @GetMapping("/movie/{movieId}/date")
    public ResponseEntity<List<Show>>
    getShowByMovieAndDate(@PathVariable Long movieId, @RequestParam @DateTimeFormat(iso=DateTimeFormat.ISO.DATE)LocalDate date)
    {
        return ResponseEntity.ok(showService.getShowByMovieAndDate(movieId,date));
    }

    public record SeatView(Long id, String seatNumber, String row, Integer col,
                           SeatType seatType, boolean booked) {}

    @GetMapping("/{id}/seats")
    public List<SeatView> seats(@PathVariable Long id) {
        Show show = showRepository.findById(id).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Show not found"));

        Set<Long> taken = new HashSet<>(bookingRepo.findBookedSeatIdByShowId(id));

        return seatRepository.findByScreenId(show.getScreen().getId()).stream()
                .map(s -> new SeatView(s.getId(), s.getSeatNumber(), s.getRow(), s.getCol(),
                        s.getSeatType(), taken.contains(s.getId())))
                .toList();
    }



}
