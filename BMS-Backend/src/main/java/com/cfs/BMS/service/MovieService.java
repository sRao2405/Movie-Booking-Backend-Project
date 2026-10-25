package com.cfs.BMS.service;

import com.cfs.BMS.entity.Movie;
import com.cfs.BMS.repository.MovieRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MovieService {

    private final MovieRepository movieRepository;
//    private final TheatreRepository theatreRepository;

    public Movie addMovie(Movie movie)
    {
        return movieRepository.save(movie);
    }

    public List<Movie> getAllMovies()
    {
        return movieRepository.findAll();
    }

    public Movie getMovieById(Long id)
    {
        return movieRepository.findById(id)
                .orElseThrow(()-> new RuntimeException("Movie not found with id: " +id));
    }

    public List<Movie> searchByTitle(String title) {
        return movieRepository.findByTitleContainingIgnoreCase(title);
    }

    public List<Movie> getByGenre(String genre) {
        return movieRepository.findByGenre(genre);
    }

    public List<Movie> getByLanguage(String language){
        return movieRepository.findByLanguage(language);
    }

    public void deleteMovie(Long id)
    {
        Movie movie = getMovieById(id);
        movieRepository.delete(movie);
    }

    public Movie updateMovie(Long id, Movie updatedMovie)
    {
        Movie existing = getMovieById(id);

        existing.setTitle(updatedMovie.getTitle());
        existing.setGenre(updatedMovie.getGenre());
        existing.setLanguage(updatedMovie.getLanguage());
        existing.setDescription(updatedMovie.getDescription());
        existing.setDurationMinutes(updatedMovie.getDurationMinutes());
        existing.setRating(updatedMovie.getRating());
        existing.setReleaseDate(updatedMovie.getReleaseDate());
        existing.setPosterUrl(updatedMovie.getPosterUrl());

        return movieRepository.save(existing);

    }
}
