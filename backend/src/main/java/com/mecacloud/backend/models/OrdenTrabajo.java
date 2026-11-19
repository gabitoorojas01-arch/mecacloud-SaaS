package com.mecacloud.backend.models;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "ordenes_trabajo")
public class OrdenTrabajo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_orden")
    private Integer idOrden;

    @ManyToOne
    @JoinColumn(name = "placa", nullable = false)
    private Vehiculo vehiculo;

    @ManyToOne
    @JoinColumn(name = "id_mecanico")
    private Usuario mecanico;

    @Column(name = "estado", nullable = false, length = 20)
    private String estado = "PENDIENTE";

    @Column(name = "descripcion_falla", nullable = false, columnDefinition = "TEXT")
    private String descripcionFalla;

    @Column(name = "fecha_ingreso", updatable = false)
    private LocalDateTime fechaIngreso;

    @Column(name = "fecha_entrega")
    private LocalDateTime fechaEntrega;

    // Se ejecuta automáticamente justo antes de guardar en PostgreSQL
    @PrePersist
    protected void alCrear() {
        this.fechaIngreso = LocalDateTime.now();
        if (this.estado == null || this.estado.isBlank()) {
            this.estado = "PENDIENTE";
        }
    }
}