package com.mecacloud.backend.controllers;

import com.mecacloud.backend.models.OrdenTrabajo;
import com.mecacloud.backend.services.OrdenTrabajoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ordenes")
@CrossOrigin(origins = "*")
public class OrdenTrabajoController {

    @Autowired
    private OrdenTrabajoService ordenTrabajoService;

    // Endpoint GET: http://localhost:8080/api/ordenes (Trae todas las tarjetas del Kanban)
    @GetMapping
    public List<OrdenTrabajo> listarOrdenes() {
        return ordenTrabajoService.obtenerTodas();
    }

    // Endpoint GET: http://localhost:8080/api/ordenes/vehiculo/ABC123 (Hoja de vida por placa)
    @GetMapping("/vehiculo/{placa}")
    public List<OrdenTrabajo> historialPorPlaca(@PathVariable String placa) {
        return ordenTrabajoService.obtenerHistorialPorPlaca(placa);
    }

    // Endpoint POST: http://localhost:8080/api/ordenes (Crea una orden nueva en PENDIENTE)
    @PostMapping
    public ResponseEntity<?> crearOrden(@RequestBody OrdenTrabajo orden) {
        try {
            OrdenTrabajo nuevaOrden = ordenTrabajoService.crearOrden(orden);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevaOrden);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", e.getMessage()));
        }
    }

    // Endpoint PATCH: http://localhost:8080/api/ordenes/1/estado (Mueve tarjeta en el Kanban)
    @PatchMapping("/{idOrden}/estado")
    public ResponseEntity<?> cambiarEstado(@PathVariable Integer idOrden, @RequestBody Map<String, String> body) {
        try {
            String nuevoEstado = body.get("estado");
            OrdenTrabajo actualizada = ordenTrabajoService.cambiarEstado(idOrden, nuevoEstado);
            return ResponseEntity.ok(actualizada);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Endpoint PATCH: http://localhost:8080/api/ordenes/1/mecanico/1 (Asigna un mecánico)
    @PatchMapping("/{idOrden}/mecanico/{idMecanico}")
    public ResponseEntity<?> asignarMecanico(@PathVariable Integer idOrden, @PathVariable Integer idMecanico) {
        try {
            OrdenTrabajo actualizada = ordenTrabajoService.asignarMecanico(idOrden, idMecanico);
            return ResponseEntity.ok(actualizada);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}