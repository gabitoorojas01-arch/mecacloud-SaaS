package com.mecacloud.backend.controllers;

import com.mecacloud.backend.models.Cliente;
import com.mecacloud.backend.services.ClienteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clientes")
@CrossOrigin(origins = "*")
public class ClienteController {

    @Autowired
    private ClienteService clienteService;

    // Endpoint GET: http://localhost:8080/api/clientes
    @GetMapping
    public List<Cliente> listarClientes() {
        return clienteService.obtenerTodos();
    }

    // Endpoint GET: http://localhost:8080/api/clientes/documento/10203040
    @GetMapping("/documento/{numeroDocumento}")
    public ResponseEntity<Cliente> buscarPorDocumento(@PathVariable String numeroDocumento) {
        return clienteService.obtenerPorDocumento(numeroDocumento)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Endpoint POST: http://localhost:8080/api/clientes
    @PostMapping
    public ResponseEntity<?> crearCliente(@RequestBody Cliente cliente) {
        try {
            Cliente nuevoCliente = clienteService.guardarCliente(cliente);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevoCliente);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}