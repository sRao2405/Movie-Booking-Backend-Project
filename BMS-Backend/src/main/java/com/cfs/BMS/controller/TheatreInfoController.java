package com.cfs.BMS.controller;

import com.cfs.BMS.entity.Show;
import com.cfs.BMS.repository.ScreenRepository;
import com.cfs.BMS.repository.ShowRepository;
import com.cfs.BMS.repository.TheatreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/theatre-info")
@CrossOrigin
@RequiredArgsConstructor
public class TheatreInfoController {

    private final TheatreRepository theatreRepo;
    private final ScreenRepository screenRepo;
    private final ShowRepository showRepo;

    public record ScreenView(Long id, String name, Integer totalSeats) {}
    public record TheatreView(Long id, String name, String address, String city,
                              String state, List<ScreenView> screens, int totalSeats) {}

    @GetMapping
    public List<TheatreView> theatres(@RequestParam Long cityId) {
        return theatreRepo.findByCityId(cityId).stream().map(t -> {
            List<ScreenView> screens = screenRepo.findByTheatreId(t.getId()).stream()
                    .map(s -> new ScreenView(s.getId(), s.getName(), s.getTotalSeats()))
                    .toList();
            int total = screens.stream()
                    .mapToInt(s -> s.totalSeats() == null ? 0 : s.totalSeats()).sum();
            return new TheatreView(t.getId(), t.getName(), t.getAddress(),
                    t.getCity().getName(), t.getCity().getState(), screens, total);
        }).toList();
    }

    @GetMapping("/{id}/shows")
    public List<Show> shows(@PathVariable Long id) {
        return showRepo.findShowsByTheatre(id);
    }
}
