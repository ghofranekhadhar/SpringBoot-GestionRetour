package com.example.spring_retours.services;

import com.example.spring_retours.models.NonConformite;
import com.example.spring_retours.repositories.NonConformiteRepository;
import com.example.spring_retours.repositories.ProduitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NonConformiteService {

    private final NonConformiteRepository nonConformiteRepository;
    private final ProduitRepository produitRepository;

    public List<NonConformite> getAll() {
        return nonConformiteRepository.findAll();
    }

    public NonConformite getById(Long id) {
        return nonConformiteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("NonConformite non trouvée: " + id));
    }

    public NonConformite create(NonConformite nc) {
        if (nc.getProduit() != null && nc.getProduit().getId() != null) {
            produitRepository.findById(nc.getProduit().getId()).ifPresent(nc::setProduit);
        }
        return nonConformiteRepository.save(nc);
    }

    public NonConformite update(Long id, NonConformite nc) {
        NonConformite existing = getById(id);
        existing.setDescription(nc.getDescription());
        existing.setGravite(nc.getGravite());
        if (nc.getProduit() != null) existing.setProduit(nc.getProduit());
        return nonConformiteRepository.save(existing);
    }

    public void delete(Long id) {
        nonConformiteRepository.deleteById(id);
    }
}
