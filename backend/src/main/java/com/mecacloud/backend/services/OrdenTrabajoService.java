package com.mecacloud.backend.services;

import com.mecacloud.backend.models.OrdenTrabajo;
import com.mecacloud.backend.models.Usuario;
import com.mecacloud.backend.models.Vehiculo;
import com.mecacloud.backend.repositories.OrdenTrabajoRepository;
import com.mecacloud.backend.repositories.UsuarioRepository;
import com.mecacloud.backend.repositories.VehiculoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Service
public class OrdenTrabajoService {

    @Autowired
    private OrdenTrabajoRepository ordenTrabajoRepository;

    @Autowired
    private VehiculoRepository vehiculoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    private static final Set<String> ESTADOS_VALIDOS = Set.of("PENDIENTE", "EN_PROGRESO", "TERMINADO");

    // Obtener todas las órdenes para poblar el Tablero Kanban
    public List<OrdenTrabajo> obtenerTodas() {
        return ordenTrabajoRepository.findAll();
    }

    // Obtener el historial clínico/técnico de un carro por su placa
    public List<OrdenTrabajo> obtenerHistorialPorPlaca(String placa) {
        return ordenTrabajoRepository.findByVehiculoPlacaOrderByFechaIngresoDesc(placa.trim().toUpperCase());
    }

    // Crear una nueva orden de trabajo (ingreso de vehículo al taller)
    public OrdenTrabajo crearOrden(OrdenTrabajo orden) {
        // 1. Validar que el vehículo exista
        String placa = orden.getVehiculo().getPlaca().trim().toUpperCase();
        Vehiculo vehiculoReal = vehiculoRepository.findById(placa)
                .orElseThrow(() -> new RuntimeException("No existe un vehículo registrado con la placa: " + placa));
        orden.setVehiculo(vehiculoReal);

        // 2. Si viene un mecánico asignado, validar que exista y sea MECANICO
        if (orden.getMecanico() != null && orden.getMecanico().getIdUsuario() != null) {
            Integer idMecanico = orden.getMecanico().getIdUsuario();
            Usuario mecanicoReal = usuarioRepository.findById(idMecanico)
                    .orElseThrow(() -> new RuntimeException("El mecánico con ID " + idMecanico + " no existe."));
            
            if (!"MECANICO".equals(mecanicoReal.getRol())) {
                throw new RuntimeException("El usuario seleccionado no tiene el rol de MECANICO.");
            }
            orden.setMecanico(mecanicoReal);
        } else {
            orden.setMecanico(null); // No se asigna mecánico aún
        }

        orden.setEstado("PENDIENTE");
        return ordenTrabajoRepository.save(orden);
    }

    // Mover tarjeta en el Tablero Kanban (Actualizar estado)
    public OrdenTrabajo cambiarEstado(Integer idOrden, String nuevoEstado) {
        String estadoLimpio = nuevoEstado.trim().toUpperCase();
        if (!ESTADOS_VALIDOS.contains(estadoLimpio)) {
            throw new RuntimeException("Estado inválido. Valores permitidos: PENDIENTE, EN_PROGRESO, TERMINADO.");
        }

        OrdenTrabajo orden = ordenTrabajoRepository.findById(idOrden)
                .orElseThrow(() -> new RuntimeException("No se encontró la orden de trabajo #" + idOrden));

        orden.setEstado(estadoLimpio);

        // Si el trabajo finalizó, sellamos la fecha y hora de entrega automáticamente
        if ("TERMINADO".equals(estadoLimpio)) {
            orden.setFechaEntrega(LocalDateTime.now());
        }

        return ordenTrabajoRepository.save(orden);
    }

    // Asignar o reasignar mecánico a una orden existente
    public OrdenTrabajo asignarMecanico(Integer idOrden, Integer idMecanico) {
        OrdenTrabajo orden = ordenTrabajoRepository.findById(idOrden)
                .orElseThrow(() -> new RuntimeException("No se encontró la orden de trabajo #" + idOrden));

        Usuario mecanico = usuarioRepository.findById(idMecanico)
                .orElseThrow(() -> new RuntimeException("El mecánico con ID " + idMecanico + " no existe."));

        if (!"MECANICO".equals(mecanico.getRol())) {
            throw new RuntimeException("Solo se pueden asignar usuarios con rol MECANICO.");
        }

        orden.setMecanico(mecanico);
        return ordenTrabajoRepository.save(orden);
    }
}