package com.cfs.BMS.entity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "theatres")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Theatre {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String address;

    @ManyToOne
    @JoinColumn(name="city_id",nullable = false)
    private City city;

    public Long getCityId() {
        return city != null ? city.getId() : null;
    }
}
