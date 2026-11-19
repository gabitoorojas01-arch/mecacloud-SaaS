package com.mecacloud.backend.repositories;

import com.mecacloud.backend.models.Repuesto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RepuestoRepository extends JpaRepository<Repuesto, Integer> {

    // Busca un repuesto por su código de barras o referencia interna
    Optional<Repuesto> findByCodigo(String codigo);

    // Consulta Inteligente: Trae únicamente los repuestos en alerta de stock bajo
    @Query("SELECT r FROM Repuesto r WHERE r.stockActual <= r.stockMinimo")
    List<Repuesto> findRepuestosConStockBajo();
}