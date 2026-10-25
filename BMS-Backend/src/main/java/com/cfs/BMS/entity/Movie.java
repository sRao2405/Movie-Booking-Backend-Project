package com.cfs.BMS.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "movies")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Movie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String description;
    private String title;
    private String genre;
    private String language;
    private Integer durationMinutes;
    private Double rating;
    private LocalDate releaseDate;
    private String posterUrl;
}
