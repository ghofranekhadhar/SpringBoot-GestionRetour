package com.example.spring_retours.repositories;

import com.example.spring_retours.models.Produit;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProduitRepository extends JpaRepository<Produit, Long> {
    long count();
}
