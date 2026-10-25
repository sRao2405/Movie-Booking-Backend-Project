package com.cfs.BMS.controller;

import com.cfs.BMS.entity.Seat;
import com.cfs.BMS.entity.User;
import com.cfs.BMS.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepo;

    public record LoginRequest(String email, String password) {}
    public record RegisterRequest(String name, String email, String phone, String password) {}

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody LoginRequest req) {
        User u = userRepo.findByEmail(req.email().trim().toLowerCase())
                .filter(x -> x.getPassword().equals(req.password()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));
        return view(u);
    }

    @PostMapping("/register")
    public Map<String, Object> register(@RequestBody RegisterRequest req) {
        String email = req.email().trim().toLowerCase();
        if (userRepo.findByEmail(email).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        }
        User u = userRepo.save(User.builder()
                .name(req.name()).email(email).phone(req.phone()).password(req.password()).build());
        return view(u);
    }

    // Never return the entity: it contains the password
    private Map<String, Object> view(User u) {
        return Map.of("id", u.getId(), "name", u.getName(), "email", u.getEmail());
    }


}