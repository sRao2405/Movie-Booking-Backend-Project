package com.cfs.BMS.controller;

import com.cfs.BMS.entity.Movie;
import com.cfs.BMS.entity.Show;
import com.cfs.BMS.repository.ShowRepository;
import com.cfs.BMS.service.MovieService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/movies")
@RequiredArgsConstructor
public class MovieController {

    private final MovieService movieService;
    private final ShowRepository showRepository;

    @GetMapping
    public ResponseEntity<List<Movie>> getAllMovies()
    {
        return ResponseEntity.ok(movieService.getAllMovies());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Movie> getMovieById(@PathVariable Long id)
    {
        return ResponseEntity.ok(movieService.getMovieById(id));
    }

    @GetMapping("/search/{title}")
    public ResponseEntity<List<Movie>> searchMovies(@PathVariable String title)
    {
        return ResponseEntity.ok(movieService.searchByTitle(title));
    }

    @GetMapping("/genre/{genre}")
    public ResponseEntity<List<Movie>> getByGenre(@PathVariable String genre)
    {
        return ResponseEntity.ok(movieService.getByGenre(genre));
    }

    @GetMapping("/genre/{language}")
    public ResponseEntity<List<Movie>> getByLanguage(@PathVariable String language)
    {
        return ResponseEntity.ok(movieService.getByLanguage(language));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Movie> updateMovie(@PathVariable Long id, @RequestBody Movie movie)
    {
        return ResponseEntity.ok(movieService.updateMovie(id,movie));
    }

    @PostMapping()
    public ResponseEntity<Movie> addMovies(@RequestBody Movie movie)
    {
        return ResponseEntity.status(HttpStatus.CREATED).body(movieService.addMovie(movie));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMovie(@PathVariable Long id) {
        movieService.deleteMovie(id);
        return ResponseEntity.noContent().build();
    }
    @GetMapping("/{movieId}/shows")
    public ResponseEntity<List<Show>> getShows(@PathVariable Long movieId,
                                               @RequestParam Long cityId) {
        return ResponseEntity.ok(
                showRepository.findShowsByMovieAndCity(movieId, cityId));
    }






}
