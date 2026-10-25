package com.cfs.BMS.dto;

import java.time.LocalDateTime;
import java.util.List;

public record BookingResponse(Long id, String status, Double totalPrice, LocalDateTime bookedAt,
                              Long showId, String movieTitle, String theatreName,
                              String screenName, LocalDateTime startTime, List<String> seats) {}