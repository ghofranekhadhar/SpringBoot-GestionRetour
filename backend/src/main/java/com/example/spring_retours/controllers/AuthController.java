package com.example.spring_retours.controllers;

import com.example.spring_retours.models.AuthRequest;
import com.example.spring_retours.models.AuthResponse;
import com.example.spring_retours.models.Utilisateur;
import com.example.spring_retours.services.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody Utilisateur request) {
        return ResponseEntity.ok(authService.register(request));
    }
}
