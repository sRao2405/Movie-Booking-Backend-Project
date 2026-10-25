package com.cfs.BMS.service;

import com.cfs.BMS.dto.SeatRequest;
import com.cfs.BMS.entity.Seat;
import com.cfs.BMS.repository.ScreenRepository;
import com.cfs.BMS.repository.SeatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SeatService {

    private final SeatRepository seatRepository;
    private final ScreenRepository screenRepository;

    //Add seat

    public Seat addSeat(SeatRequest request)
    {
        com.cfs.BMS.entity.Screen screen= screenRepository.findById(request.getScreenId())
                .orElseThrow(()->new RuntimeException("Screen not found with id: " + request));
        if (seatRepository.existsByScreenIdAndRowAndCol(screen.getId(), request.getRow(), request.getCol())) {
            throw new RuntimeException("Seat " + request.getRow() + request.getCol() + " Already Exist on this screen");
        }

        Seat seat = Seat.builder()
                .row(request.getRow())
                .col(request.getCol())
                .seatNumber(request.getRow() + request.getCol())
                .seatType(request.getSeatType())
                .screen(screen)
                .build();
        return seatRepository.save(seat);
    }

    public List<Seat> getSeatsByScreen(Long screenId)
    {
        return seatRepository.findByScreenId(screenId);
    }

    public Seat getSeatById(Long id)
    {
        return seatRepository.findById(id)
                .orElseThrow(()-> new RuntimeException("Seat not found with id: " + id));
    }

}
