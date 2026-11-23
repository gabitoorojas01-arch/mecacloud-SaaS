package com.mecacloud.backend.controllers;

import com.mecacloud.backend.models.Vehiculo;
import com.mecacloud.backend.services.VehiculoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/vehiculos")
@CrossOrigin(origins = "*")
public class VehiculoController {

    @Autowired
    private VehiculoService vehiculoService;

    // Endpoint GET: http://localhost:8080/api/vehiculos
    @GetMapping
    public List<Vehiculo> listarVehiculos() {
        return vehiculoService.obtenerTodos();
    }

    // Endpoint GET: http://localhost:8080/api/vehiculos/ABC123 (Consulta por placa)
    @GetMapping("/{placa}")
    public ResponseEntity<Vehiculo> buscarPorPlaca(@PathVariable String placa) {
        return vehiculoService.buscarPorPlaca(placa)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Endpoint POST: http://localhost:8080/api/vehiculos
    @PostMapping
    public ResponseEntity<?> registrarVehiculo(@RequestBody Vehiculo vehiculo) {
        try {
            Vehiculo nuevoVehiculo = vehiculoService.registrarVehiculo(vehiculo);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevoVehiculo);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    // Endpoint DELETE: http://localhost:8080/api/vehiculos/ABC123
    @DeleteMapping("/{placa}")
    public ResponseEntity<?> eliminarVehiculo(@PathVariable String placa) {
        try {
            vehiculoService.eliminarVehiculo(placa);
            return ResponseEntity.ok(Map.of("mensaje", "Vehículo " + placa.toUpperCase() + " eliminado correctamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", e.getMessage()));
        }
    }
}