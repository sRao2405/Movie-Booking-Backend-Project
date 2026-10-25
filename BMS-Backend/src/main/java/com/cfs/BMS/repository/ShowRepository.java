package com.cfs.BMS.repository;

import com.cfs.BMS.entity.Show;
import org.springframework.cglib.core.Local;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface ShowRepository extends JpaRepository<Show, Long> {



    List<Show> findByMovieId(Long movieId);
    List<Show> findByScreenId(Long screenId);
    List<Show> findByMovieIdAndShowDate(Long movieId, LocalDate showDate);
    List<Show> findByScreenIdAndShowDate(Long screenId, LocalDate showDate);
    List<Show> findByMovieIdAndScreenTheatreCityIdOrderByStartTime(Long movieId, Long cityId);

    // used by GET /api/movies/{movieId}/shows?cityId=
    @Query("""
           select s from Show s
           where s.movie.id = :movieId
             and s.screen.theatre.city.id = :cityId
           order by s.startTime
           """)
    List<Show> findShowsByMovieAndCity(@Param("movieId") Long movieId,
                                       @Param("cityId") Long cityId);


    @Query("""
       select s from Show s
       where s.screen.theatre.id = :theatreId
       order by s.startTime
       """)
    List<Show> findShowsByTheatre(@Param("theatreId") Long theatreId);

    @Query("select count(s) > 0 from Show s where s.screen.id = :screenId " +
            "and s.startTime < :endTime and s.endTime > :startTime")
    boolean existsOverlap(@Param("screenId") Long screenId,
                          @Param("startTime") LocalDateTime startTime,
                          @Param("endTime") LocalDateTime endTime);
}
