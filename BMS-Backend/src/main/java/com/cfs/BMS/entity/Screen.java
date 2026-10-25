package com.cfs.BMS.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "screens")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Screen {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name; //AUDI-1, AUDI-2

    private Integer totalSeats;

    @ManyToOne
    @JoinColumn(name= "theatre_id" , nullable = false )
    private Theatre theatre;
}
