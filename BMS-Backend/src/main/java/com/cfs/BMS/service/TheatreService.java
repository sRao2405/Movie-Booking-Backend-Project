package com.cfs.BMS.service;

import com.cfs.BMS.entity.City;
import com.cfs.BMS.entity.Theatre;
import com.cfs.BMS.repository.TheatreRepository;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.Nullable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TheatreService {

    private final TheatreRepository theatreRepository;
    private final CityService cityService;

    public Theatre addTheatre(Theatre request)
    {
        City city = cityService.getCityById(request.getCityId());
        Theatre theatre = Theatre.builder()
                .name(request.getName())
                .address(request.getAddress())
                .city(city)
                .build();
        return theatreRepository.save(theatre);
    }

    public List<Theatre> getAllTheatres()
    {
        return theatreRepository.findAll();
    }

    public Theatre getTheatreById(Long id)
    {
        return theatreRepository.findById(id)
                .orElseThrow(()-> new RuntimeException("Theatre not found with id: " + id));
    }

    public List<Theatre> getTheatreByCity(Long cityId)
    {
        return theatreRepository.findByCityId(cityId);
    }


}
