package com.example.spring_retours.services;

import com.example.spring_retours.models.HistoriqueRetour;
import com.example.spring_retours.repositories.HistoriqueRetourRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HistoriqueRetourService {

    private final HistoriqueRetourRepository historiqueRetourRepository;

    public List<HistoriqueRetour> getAll() {
        return historiqueRetourRepository.findAll();
    }

    public List<HistoriqueRetour> getByRetourId(Long retourId) {
        return historiqueRetourRepository.findByRetourId(retourId);
    }

    public List<HistoriqueRetour> getByEmployeId(Long employeId) {
        return historiqueRetourRepository.findByEmployeId(employeId);
    }

    public HistoriqueRetour getById(Long id) {
        return historiqueRetourRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("HistoriqueRetour non trouvé: " + id));
    }

    public void delete(Long id) {
        historiqueRetourRepository.deleteById(id);
    }
}
