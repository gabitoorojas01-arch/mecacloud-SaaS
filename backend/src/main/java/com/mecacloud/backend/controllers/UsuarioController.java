package com.mecacloud.backend.controllers;

import com.mecacloud.backend.models.Usuario;
import com.mecacloud.backend.services.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    // Endpoint GET: http://localhost:8080/api/usuarios (Lista todos sin mostrar contraseñas)
    @GetMapping
    public List<Usuario> listarUsuarios() {
        return usuarioService.obtenerTodos();
    }

    // Endpoint GET: http://localhost:8080/api/usuarios/rol/MECANICO (Trae solo los mecánicos para el Kanban)
    @GetMapping("/rol/{rol}")
    public List<Usuario> listarPorRol(@PathVariable String rol) {
        return usuarioService.obtenerPorRol(rol);
    }

    // Endpoint POST: http://localhost:8080/api/usuarios (Registra un empleado encriptando su clave)
    @PostMapping
    public ResponseEntity<?> registrarUsuario(@RequestBody Usuario usuario) {
        try {
            Usuario nuevoUsuario = usuarioService.registrarUsuario(usuario);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevoUsuario);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}