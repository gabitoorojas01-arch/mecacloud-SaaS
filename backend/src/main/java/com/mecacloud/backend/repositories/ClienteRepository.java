package com.mecacloud.backend.repositories;

import com.mecacloud.backend.models.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Integer> {

    // Consulta personalizada: Spring Boot escribe el SQL solo con leer el nombre del método
    Optional<Cliente> findByNumeroDocumento(String numeroDocumento);
}