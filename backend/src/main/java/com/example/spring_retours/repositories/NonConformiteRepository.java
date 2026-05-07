package com.example.spring_retours.repositories;

import com.example.spring_retours.models.NonConformite;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NonConformiteRepository extends JpaRepository<NonConformite, Long> {
}
