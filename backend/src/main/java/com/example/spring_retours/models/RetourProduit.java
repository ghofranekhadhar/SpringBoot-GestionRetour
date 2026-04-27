package com.example.spring_retours.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "retours")
public class RetourProduit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Le produit est obligatoire")
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "produit_id")
    private Produit produit;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "client_id")
    private Utilisateur client;

    @NotBlank(message = "Le motif de retour est obligatoire")
    private String motif;
    private String statut; // "EN_ATTENTE", "VALIDE", "REJETE"
    private LocalDate dateRetour;
    
    @PrePersist
    public void prePersist() {
        if(this.dateRetour == null) {
            this.dateRetour = LocalDate.now();
        }
        if(this.statut == null || this.statut.isEmpty()) {
            this.statut = "EN_ATTENTE";
        }
    }
}
