package com.cfs.BMS.controller;

import com.cfs.BMS.entity.Screen;
import com.cfs.BMS.service.ScreenService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/screens")
@RequiredArgsConstructor
public class ScreenController {

    private final ScreenService screenService;

    @GetMapping
    public ResponseEntity<List<Screen>> getAllScreens()
    {
        return ResponseEntity.ok(screenService.getAllScreens());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Screen> getScreenById(@PathVariable Long id)
    {
        return ResponseEntity.ok(screenService.getScreenById(id));
    }

    @GetMapping("/theatre/{theatreId}")
    public ResponseEntity<List<Screen>> getScreensByTheatreId(@PathVariable Long theatreId)
    {
        return ResponseEntity.ok(screenService.getScreenByTheatre(theatreId));
    }

}
