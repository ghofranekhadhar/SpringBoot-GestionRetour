package com.example.spring_retours.models;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardMetrics {
    private long totalProduits;
    private long retoursEnAttente;
    private long retoursValides;
    private long retoursRejetes;
    private long utilisateursActifs;
    private long totalHistorique;
    private long totalStock;
}
