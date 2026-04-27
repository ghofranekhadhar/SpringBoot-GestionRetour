package com.example.spring_retours.controllers;

import com.example.spring_retours.models.RetourProduit;
import com.example.spring_retours.services.RetourService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/retours")
@RequiredArgsConstructor
public class RetourController {

    private final RetourService retourService;

    @GetMapping
    public ResponseEntity<List<RetourProduit>> getAll() {
        return ResponseEntity.ok(retourService.getAll());
    }

    @GetMapping("/me")
    public ResponseEntity<List<RetourProduit>> getMyRetours(Principal principal) {
        return ResponseEntity.ok(retourService.getByClientEmail(principal.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RetourProduit> getById(@PathVariable Long id) {
        return ResponseEntity.ok(retourService.getById(id));
    }

    @PostMapping
    public ResponseEntity<RetourProduit> create(@Valid @RequestBody RetourProduit retour,
                                                 @RequestParam(required = false) Long employeId) {
        return ResponseEntity.ok(retourService.create(retour, employeId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RetourProduit> update(@PathVariable Long id, @Valid @RequestBody RetourProduit retour) {
        return ResponseEntity.ok(retourService.update(id, retour));
    }

    @PutMapping("/{id}/valider")
    public ResponseEntity<RetourProduit> valider(@PathVariable Long id,
                                                  @RequestParam(required = false) Long employeId) {
        return ResponseEntity.ok(retourService.valider(id, employeId));
    }

    @PutMapping("/{id}/rejeter")
    public ResponseEntity<RetourProduit> rejeter(@PathVariable Long id,
                                                  @RequestParam(required = false) Long employeId) {
        return ResponseEntity.ok(retourService.rejeter(id, employeId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        retourService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
