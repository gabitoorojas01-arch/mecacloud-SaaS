package com.mecacloud.backend.controllers;

import com.mecacloud.backend.models.DetalleOrden;
import com.mecacloud.backend.models.Repuesto;
import com.mecacloud.backend.services.InventarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventario")
@CrossOrigin(origins = "*")
public class InventarioController {

    @Autowired
    private InventarioService inventarioService;

    // Endpoint GET: http://localhost:8080/api/inventario (Lista todo el inventario)
    @GetMapping
    public List<Repuesto> listarInventario() {
        return inventarioService.obtenerTodos();
    }

    // Endpoint GET: http://localhost:8080/api/inventario/alertas (Trae solo repuestos en alerta roja)
    @GetMapping("/alertas")
    public List<Repuesto> listarAlertasStockBajo() {
        return inventarioService.obtenerAlertasStockBajo();
    }

    // Endpoint POST: http://localhost:8080/api/inventario (Registra un repuesto nuevo en bodega)
    @PostMapping
    public ResponseEntity<?> registrarRepuesto(@RequestBody Repuesto repuesto) {
        try {
            Repuesto nuevo = inventarioService.registrarRepuesto(repuesto);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevo);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Endpoint PATCH: http://localhost:8080/api/inventario/1/reabastecer (Suma unidades al stock)
    @PatchMapping("/{idRepuesto}/reabastecer")
    public ResponseEntity<?> reabastecerStock(@PathVariable Integer idRepuesto, @RequestBody Map<String, Integer> body) {
        try {
            Integer cantidad = body.get("cantidad");
            Repuesto actualizado = inventarioService.agregarStock(idRepuesto, cantidad);
            return ResponseEntity.ok(actualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Endpoint POST: http://localhost:8080/api/inventario/asignar-orden (Carga repuesto a una orden y descuenta stock)
    @PostMapping("/asignar-orden")
    public ResponseEntity<?> asignarRepuestoAOrden(@RequestBody Map<String, Integer> body) {
        try {
            Integer idOrden = body.get("idOrden");
            Integer idRepuesto = body.get("idRepuesto");
            Integer cantidad = body.get("cantidad");
            DetalleOrden detalle = inventarioService.asignarRepuestoAOrden(idOrden, idRepuesto, cantidad);
            return ResponseEntity.status(HttpStatus.CREATED).body(detalle);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Endpoint GET: http://localhost:8080/api/inventario/orden/1 (Consulta repuestos usados en una orden)
    @GetMapping("/orden/{idOrden}")
    public List<DetalleOrden> listarRepuestosDeOrden(@PathVariable Integer idOrden) {
        return inventarioService.obtenerDetallesPorOrden(idOrden);
    }
}