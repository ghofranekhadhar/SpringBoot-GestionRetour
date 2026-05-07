package com.example.spring_retours.controllers;

import com.example.spring_retours.models.NonConformite;
import com.example.spring_retours.services.NonConformiteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/non-conformites")
@RequiredArgsConstructor
public class NonConformiteController {

    private final NonConformiteService nonConformiteService;

    @GetMapping
    public ResponseEntity<List<NonConformite>> getAll() {
        return ResponseEntity.ok(nonConformiteService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<NonConformite> getById(@PathVariable Long id) {
        return ResponseEntity.ok(nonConformiteService.getById(id));
    }

    @PostMapping
    public ResponseEntity<NonConformite> create(@Valid @RequestBody NonConformite nc) {
        return ResponseEntity.ok(nonConformiteService.create(nc));
    }

    @PutMapping("/{id}")
    public ResponseEntity<NonConformite> update(@PathVariable Long id, @Valid @RequestBody NonConformite nc) {
        return ResponseEntity.ok(nonConformiteService.update(id, nc));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        nonConformiteService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
