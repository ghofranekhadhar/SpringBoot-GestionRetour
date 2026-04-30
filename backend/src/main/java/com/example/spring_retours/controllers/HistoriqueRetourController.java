package com.example.spring_retours.controllers;

import com.example.spring_retours.models.HistoriqueRetour;
import com.example.spring_retours.services.HistoriqueRetourService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/historique-retours")
@RequiredArgsConstructor
public class HistoriqueRetourController {

    private final HistoriqueRetourService historiqueRetourService;

    @GetMapping
    public ResponseEntity<List<HistoriqueRetour>> getAll() {
        return ResponseEntity.ok(historiqueRetourService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<HistoriqueRetour> getById(@PathVariable Long id) {
        return ResponseEntity.ok(historiqueRetourService.getById(id));
    }

    @GetMapping("/retour/{retourId}")
    public ResponseEntity<List<HistoriqueRetour>> getByRetour(@PathVariable Long retourId) {
        return ResponseEntity.ok(historiqueRetourService.getByRetourId(retourId));
    }

    @GetMapping("/employe/{employeId}")
    public ResponseEntity<List<HistoriqueRetour>> getByEmploye(@PathVariable Long employeId) {
        return ResponseEntity.ok(historiqueRetourService.getByEmployeId(employeId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        historiqueRetourService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
