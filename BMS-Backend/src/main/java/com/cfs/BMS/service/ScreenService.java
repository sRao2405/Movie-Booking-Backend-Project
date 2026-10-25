package com.cfs.BMS.service;

import com.cfs.BMS.entity.Screen;
import com.cfs.BMS.repository.ScreenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ScreenService {

    private final ScreenRepository screenRepository;
    private final TheatreService theatreService;

    public Screen addScreen(Screen screen)
    {
        return screenRepository.save(screen);
    }

    public List<Screen> getAllScreens()
    {
        return screenRepository.findAll();
    }

    public Screen getScreenById(Long id)
    {
        return screenRepository.findById(id)
                .orElseThrow(()->new RuntimeException("Screen not Found with id: "+ id));
    }

    public List<Screen> getScreenByTheatre(Long theatreId)
    {
        return screenRepository.findByTheatreId(theatreId);
    }

}
