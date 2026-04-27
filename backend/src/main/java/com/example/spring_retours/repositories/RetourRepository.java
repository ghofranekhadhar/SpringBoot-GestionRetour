package com.example.spring_retours.repositories;

import com.example.spring_retours.models.RetourProduit;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RetourRepository extends JpaRepository<RetourProduit, Long> {
    long countByStatut(String statut);
    long count();
    List<RetourProduit> findByClientEmail(String email);
}
