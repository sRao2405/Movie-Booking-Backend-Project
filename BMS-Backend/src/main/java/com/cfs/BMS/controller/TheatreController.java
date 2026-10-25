package com.cfs.BMS.controller;

import com.cfs.BMS.entity.Theatre;
import com.cfs.BMS.service.TheatreService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/theatres")
@RequiredArgsConstructor
public class TheatreController {

    private final TheatreService theatreService;


    public Theatre addTheatre(@RequestBody Theatre theatre) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(theatreService.addTheatre(theatre)).getBody();
    }

    public ResponseEntity<List<Theatre>> getAllTheatres()
    {
        return ResponseEntity.ok(theatreService.getAllTheatres());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Theatre> getTheatreById(@PathVariable Long id)
    {
        return ResponseEntity.ok(theatreService.getTheatreById(id));
    }

    @GetMapping("/city/{}")
    public ResponseEntity<List<Theatre>> getTheatreByCity(@PathVariable Long cityId)
    {
        return ResponseEntity.ok(theatreService.getTheatreByCity(cityId));
    }
    
}
