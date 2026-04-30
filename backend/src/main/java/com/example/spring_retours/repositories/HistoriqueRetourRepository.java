package com.example.spring_retours.repositories;

import com.example.spring_retours.models.HistoriqueRetour;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface HistoriqueRetourRepository extends JpaRepository<HistoriqueRetour, Long> {
    List<HistoriqueRetour> findByRetourId(Long retourId);
    List<HistoriqueRetour> findByEmployeId(Long employeId);
}
