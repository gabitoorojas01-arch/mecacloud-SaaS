package com.mecacloud.backend.repositories;

import com.mecacloud.backend.models.OrdenTrabajo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrdenTrabajoRepository extends JpaRepository<OrdenTrabajo, Integer> {

    // Trae el historial completo de reparaciones de un vehículo (Hoja de Vida por Placa)
    List<OrdenTrabajo> findByVehiculoPlacaOrderByFechaIngresoDesc(String placa);

    // Filtra las tarjetas por columna del Tablero Kanban (PENDIENTE, EN_PROGRESO, TERMINADO)
    List<OrdenTrabajo> findByEstado(String estado);

    // Trae todas las órdenes asignadas a un mecánico específico
    List<OrdenTrabajo> findByMecanicoIdUsuario(Integer idMecanico);
}