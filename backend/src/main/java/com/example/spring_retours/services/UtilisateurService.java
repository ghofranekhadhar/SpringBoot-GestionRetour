package com.example.spring_retours.services;

import com.example.spring_retours.models.Utilisateur;
import com.example.spring_retours.repositories.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UtilisateurService {

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;

    public List<Utilisateur> getAll() {
        return utilisateurRepository.findAll();
    }

    public Utilisateur getById(Long id) {
        return utilisateurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé: " + id));
    }

    public Utilisateur create(Utilisateur user) {
        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        return utilisateurRepository.save(user);
    }

    public Utilisateur update(Long id, Utilisateur user) {
        Utilisateur existing = getById(id);
        existing.setNom(user.getNom());
        existing.setEmail(user.getEmail());
        existing.setRole(user.getRole());
        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            existing.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        return utilisateurRepository.save(existing);
    }

    public void delete(Long id) {
        utilisateurRepository.deleteById(id);
    }
}
