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
@Table(name = "non_conformites")
public class NonConformite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "La description de la non-conformité est obligatoire")
    private String description;

    @NotBlank(message = "La gravité est obligatoire (FAIBLE, MOYENNE, CRITIQUE)")
    // "FAIBLE", "MOYENNE", "CRITIQUE"
    private String gravite;

    private LocalDate date;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "produit_id")
    private Produit produit;

    @PrePersist
    public void prePersist() {
        if(this.date == null) {
            this.date = LocalDate.now();
        }
    }
}
