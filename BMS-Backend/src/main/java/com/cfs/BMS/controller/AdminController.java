package com.cfs.BMS.controller;

import com.cfs.BMS.entity.*;
import com.cfs.BMS.enums.SeatType;
import com.cfs.BMS.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin
@RequiredArgsConstructor
public class AdminController {

    private final CityRepository cityRepo;
    private final TheatreRepository theatreRepo;
    private final ScreenRepository screenRepo;
    private final MovieRepository movieRepo;
    private final SeatRepository seatRepo;
    private final ShowRepository showRepo;

    public record CityReq(String name, String state) {}
    public record TheatreReq(String name, String address, Long cityId) {}
    public record ScreenReq(String name, Integer totalSeats, Long theatreId) {}
    public record MovieReq(String title, String description, String genre, String language,
                           Integer durationMinutes, Double rating,
                           java.time.LocalDate releaseDate, String posterUrl) {}
    public record SeatGenReq(Long screenId, Integer seatsPerRow, Integer regularRows,
                             Integer premiumRows, Integer vipRows) {}
    public record ShowReq(Long movieId, Long screenId, LocalDateTime startTime, Double ticketPrice) {}

    private static ResponseStatusException bad(HttpStatus s, String m) {
        return new ResponseStatusException(s, m);
    }
    private static String need(String v, String label) {
        if (v == null || v.isBlank()) throw bad(HttpStatus.BAD_REQUEST, label + " is required");
        return v.trim();
    }
    private static int nz(Integer v) { return v == null ? 0 : v; }

    @GetMapping("/check")
    public Map<String, Boolean> check() { return Map.of("ok", true); }

    @PostMapping("/cities")
    public City addCity(@RequestBody CityReq r) {
        String name = need(r.name(), "City name");
        if (cityRepo.existsByNameIgnoreCase(name)) throw bad(HttpStatus.CONFLICT, "City already exists");
        return cityRepo.save(City.builder().name(name).state(r.state()).build());
    }

    @PostMapping("/theatres")
    public Theatre addTheatre(@RequestBody TheatreReq r) {
        City city = cityRepo.findById(r.cityId()).orElseThrow(() -> bad(HttpStatus.NOT_FOUND, "City not found"));
        return theatreRepo.save(Theatre.builder()
                .name(need(r.name(), "Theatre name")).address(r.address()).city(city).build());
    }

    @PostMapping("/screens")
    public Screen addScreen(@RequestBody ScreenReq r) {
        Theatre t = theatreRepo.findById(r.theatreId()).orElseThrow(() -> bad(HttpStatus.NOT_FOUND, "Theatre not found"));
        return screenRepo.save(Screen.builder()
                .name(need(r.name(), "Screen name")).totalSeats(nz(r.totalSeats())).theatre(t).build());
    }

    @PostMapping("/movies")
    public Movie addMovie(@RequestBody MovieReq r) {
        if (r.durationMinutes() == null || r.durationMinutes() < 1)
            throw bad(HttpStatus.BAD_REQUEST, "Duration must be at least 1 minute");
        return movieRepo.save(Movie.builder()
                .title(need(r.title(), "Title")).description(r.description()).genre(r.genre())
                .language(r.language()).durationMinutes(r.durationMinutes()).rating(r.rating())
                .releaseDate(r.releaseDate()).posterUrl(r.posterUrl()).build());
    }

    @PostMapping("/seats/generate")
    @Transactional
    public Map<String, Object> generateSeats(@RequestBody SeatGenReq r) {
        Screen screen = screenRepo.findById(r.screenId()).orElseThrow(() -> bad(HttpStatus.NOT_FOUND, "Screen not found"));
        int per = nz(r.seatsPerRow()), reg = nz(r.regularRows()), prem = nz(r.premiumRows()), vip = nz(r.vipRows());
        int rows = reg + prem + vip;
        if (per < 1 || per > 40) throw bad(HttpStatus.BAD_REQUEST, "Seats per row must be 1 to 40");
        if (rows < 1 || rows > 26) throw bad(HttpStatus.BAD_REQUEST, "Total rows must be 1 to 26");

        int created = 0;
        for (int i = 0; i < rows; i++) {
            String row = String.valueOf((char) ('A' + i));
            SeatType type = i < reg ? SeatType.REGULAR : i < reg + prem ? SeatType.PREMIUM : SeatType.VIP;
            for (int c = 1; c <= per; c++) {
                if (seatRepo.existsByScreenIdAndRowAndCol(screen.getId(), row, c)) continue;
                seatRepo.save(Seat.builder().seatNumber(row + c).row(row).col(c)
                        .seatType(type).screen(screen).build());
                created++;
            }
        }
        int total = seatRepo.findByScreenId(screen.getId()).size();
        screen.setTotalSeats(total);
        screenRepo.save(screen);
        return Map.of("created", created, "totalSeats", total);
    }

    @PostMapping("/shows")
    public Show addShow(@RequestBody ShowReq r) {
        Movie movie = movieRepo.findById(r.movieId()).orElseThrow(() -> bad(HttpStatus.NOT_FOUND, "Movie not found"));
        Screen screen = screenRepo.findById(r.screenId()).orElseThrow(() -> bad(HttpStatus.NOT_FOUND, "Screen not found"));
        if (r.startTime() == null) throw bad(HttpStatus.BAD_REQUEST, "Start time is required");
        if (r.ticketPrice() == null || r.ticketPrice() <= 0) throw bad(HttpStatus.BAD_REQUEST, "Price must be above 0");
        if (seatRepo.findByScreenId(screen.getId()).isEmpty())
            throw bad(HttpStatus.BAD_REQUEST, "Add seats to this screen first");

        LocalDateTime end = r.startTime().plusMinutes(movie.getDurationMinutes());
        if (showRepo.existsOverlap(screen.getId(), r.startTime(), end))
            throw bad(HttpStatus.CONFLICT, "Another show already uses this screen at that time");

        return showRepo.save(Show.builder().movie(movie).screen(screen)
                .showDate(r.startTime().toLocalDate()).startTime(r.startTime())
                .endTime(end).ticketPrice(r.ticketPrice()).build());
    }
}