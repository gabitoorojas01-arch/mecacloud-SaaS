package com.mecacloud.backend.repositories;

import com.mecacloud.backend.models.Vehiculo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VehiculoRepository extends JpaRepository<Vehiculo, String> {

    // Busca todos los vehículos que pertenecen a un cliente específico
    List<Vehiculo> findByClienteIdCliente(Integer idCliente);
}