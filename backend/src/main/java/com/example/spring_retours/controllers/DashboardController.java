package com.example.spring_retours.controllers;

import com.example.spring_retours.models.DashboardMetrics;
import com.example.spring_retours.repositories.ProduitRepository;
import com.example.spring_retours.repositories.RetourRepository;
import com.example.spring_retours.repositories.UtilisateurRepository;
import com.example.spring_retours.repositories.HistoriqueRetourRepository;
import com.example.spring_retours.models.Produit;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final ProduitRepository produitRepository;
    private final RetourRepository retourRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final HistoriqueRetourRepository historiqueRetourRepository;

    @GetMapping("/metrics")
    public ResponseEntity<DashboardMetrics> getMetrics() {
        long totalStock = produitRepository.findAll().stream()
            .mapToLong(p -> p.getQuantiteEnStock() != null ? p.getQuantiteEnStock() : 0)
            .sum();

        DashboardMetrics metrics = DashboardMetrics.builder()
                .totalProduits(produitRepository.count())
                .retoursEnAttente(retourRepository.countByStatut("EN_ATTENTE"))
                .retoursValides(retourRepository.countByStatut("VALIDE"))
                .retoursRejetes(retourRepository.countByStatut("REJETE"))
                .utilisateursActifs(utilisateurRepository.count())
                .totalHistorique(historiqueRetourRepository.count())
                .totalStock(totalStock)
                .build();
        return ResponseEntity.ok(metrics);
    }
}
