package com.example.spring_retours.services;

import com.example.spring_retours.models.Produit;
import com.example.spring_retours.repositories.ProduitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProduitService {

    private final ProduitRepository produitRepository;

    public List<Produit> getAll() {
        return produitRepository.findAll();
    }

    public Produit getById(Long id) {
        return produitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produit non trouvé: " + id));
    }

    public Produit create(Produit produit) {
        return produitRepository.save(produit);
    }

    public Produit update(Long id, Produit produit) {
        Produit existing = getById(id);
        existing.setNom(produit.getNom());
        existing.setDescription(produit.getDescription());
        existing.setQuantiteEnStock(produit.getQuantiteEnStock());
        existing.setPrix(produit.getPrix());
        return produitRepository.save(existing);
    }

    public void delete(Long id) {
        produitRepository.deleteById(id);
    }
}
