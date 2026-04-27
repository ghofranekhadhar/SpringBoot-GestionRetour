package com.example.spring_retours.services;

import com.example.spring_retours.models.HistoriqueRetour;
import com.example.spring_retours.models.Produit;
import com.example.spring_retours.models.RetourProduit;
import com.example.spring_retours.repositories.HistoriqueRetourRepository;
import com.example.spring_retours.repositories.ProduitRepository;
import com.example.spring_retours.repositories.RetourRepository;
import com.example.spring_retours.repositories.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RetourService {

    private final RetourRepository retourRepository;
    private final ProduitRepository produitRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final HistoriqueRetourRepository historiqueRetourRepository;

    public List<RetourProduit> getAll() {
        return retourRepository.findAll();
    }

    public List<RetourProduit> getByClientEmail(String email) {
        return retourRepository.findByClientEmail(email);
    }

    public RetourProduit getById(Long id) {
        return retourRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Retour non trouvé: " + id));
    }

    @Transactional
    public RetourProduit create(RetourProduit retour, Long employeId) {
        // Résoudre le produit
        if (retour.getProduit() != null && retour.getProduit().getId() != null) {
            produitRepository.findById(retour.getProduit().getId())
                    .ifPresent(retour::setProduit);
        }
        // Résoudre le client
        if (retour.getClient() != null && retour.getClient().getId() != null) {
            utilisateurRepository.findById(retour.getClient().getId())
                    .ifPresent(retour::setClient);
        } else if (employeId != null) {
            utilisateurRepository.findById(employeId)
                    .ifPresent(retour::setClient);
        }
        retour.setStatut("EN_ATTENTE");
        RetourProduit saved = retourRepository.save(retour);

        // Historique : enregistrer la création
        enregistrerHistorique(saved, "CREATION", employeId);

        return saved;
    }

    @Transactional
    public RetourProduit update(Long id, RetourProduit retour) {
        RetourProduit existing = getById(id);
        existing.setMotif(retour.getMotif());
        existing.setStatut(retour.getStatut());
        if (retour.getProduit() != null) {
            existing.setProduit(retour.getProduit());
        }
        if (retour.getClient() != null) {
            existing.setClient(retour.getClient());
        }
        RetourProduit saved = retourRepository.save(existing);

        // Historique
        enregistrerHistorique(saved, "MODIFICATION", null);

        return saved;
    }

    @Transactional
    public RetourProduit valider(Long id, Long employeId) {
        RetourProduit retour = getById(id);
        retour.setStatut("VALIDE");
        RetourProduit saved = retourRepository.save(retour);

        // ✅ Mise à jour du stock : le produit retourné est remis en stock
        Produit produit = retour.getProduit();
        if (produit != null && produit.getQuantiteEnStock() != null) {
            produit.setQuantiteEnStock(produit.getQuantiteEnStock() + 1);
            produitRepository.save(produit);
        }

        // Historique
        enregistrerHistorique(saved, "VALIDATION", employeId);

        return saved;
    }

    @Transactional
    public RetourProduit rejeter(Long id, Long employeId) {
        RetourProduit retour = getById(id);
        retour.setStatut("REJETE");
        RetourProduit saved = retourRepository.save(retour);

        // ✅ Pas de mise à jour du stock (produit non récupéré)
        // Historique
        enregistrerHistorique(saved, "REJET", employeId);

        return saved;
    }

    @Transactional
    public void delete(Long id) {
        retourRepository.deleteById(id);
    }

    // ── Méthode utilitaire privée ────────────────────────────────────────
    private void enregistrerHistorique(RetourProduit retour, String action, Long employeId) {
        HistoriqueRetour historique = HistoriqueRetour.builder()
                .retour(retour)
                .action(action)
                .date(LocalDate.now())
                .build();

        if (employeId != null) {
            utilisateurRepository.findById(employeId)
                    .ifPresent(historique::setEmploye);
        }
        historiqueRetourRepository.save(historique);
    }
}
