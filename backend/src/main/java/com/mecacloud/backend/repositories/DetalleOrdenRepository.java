package com.mecacloud.backend.repositories;

import com.mecacloud.backend.models.DetalleOrden;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DetalleOrdenRepository extends JpaRepository<DetalleOrden, Integer> {

    // Lista todos los repuestos que se han instalado en una orden de trabajo específica
    List<DetalleOrden> findByOrdenTrabajoIdOrden(Integer idOrden);
}