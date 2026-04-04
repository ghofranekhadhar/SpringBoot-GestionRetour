package com.example.spring_retours.services;

import com.example.spring_retours.models.*;
import com.example.spring_retours.repositories.UtilisateurRepository;
import com.example.spring_retours.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;

    public AuthResponse login(AuthRequest request) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        Utilisateur user = utilisateurRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        String token = jwtUtils.generateToken(user);
        return AuthResponse.builder().token(token).user(user).build();
    }

    public AuthResponse register(Utilisateur request) {
        if (utilisateurRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email déjà utilisé");
        }
        Utilisateur user = Utilisateur.builder()
                .nom(request.getNom())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole() != null ? request.getRole() : EnumRole.CLIENT)
                .build();
        utilisateurRepository.save(user);
        String token = jwtUtils.generateToken(user);
        return AuthResponse.builder().token(token).user(user).build();
    }
}
