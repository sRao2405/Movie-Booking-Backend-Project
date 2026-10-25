package com.cfs.BMS.entity;

import com.cfs.BMS.enums.SeatType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "seats")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Seat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String seatNumber;

    @Column(name="seat_row")
    private String row; //A,K,L

    @Column(name="seat_col")
    private Integer col; //1,2,3,4,5....

    @Enumerated(EnumType.STRING)
    private SeatType seatType;  //REGULAR,PREMIUM,VIP

    @ManyToOne
    @JoinColumn(name="screen_id",nullable = false)
    private Screen screen;

}
