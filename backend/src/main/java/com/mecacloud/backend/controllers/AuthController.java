package com.mecacloud.backend.controllers;

import com.mecacloud.backend.config.JwtUtil;
import com.mecacloud.backend.exceptions.BusinessException;
import com.mecacloud.backend.models.Usuario;
import com.mecacloud.backend.services.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    // Endpoint público POST: http://localhost:8080/api/auth/login
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> credenciales) {
        String correo = credenciales.get("correo");
        String password = credenciales.get("password");

        if (correo == null || password == null) {
            throw new BusinessException("Debe ingresar el correo y la contraseña.");
        }

        // 1. Buscar al usuario en PostgreSQL
        Usuario usuario = usuarioService.buscarPorCorreo(correo)
                .orElseThrow(() -> new BusinessException("Credenciales inválidas: usuario no encontrado."));

        // 2. Comparar la contraseña escrita contra el hash BCrypt guardado en BD
        if (!passwordEncoder.matches(password, usuario.getPassword())) {
            throw new BusinessException("Credenciales inválidas: contraseña incorrecta.");
        }

        // 3. Generar el Token JWT firmado
        String token = jwtUtil.generarToken(usuario.getCorreo(), usuario.getRol());

        // 4. Devolver respuesta estructurada para el Frontend
        Map<String, Object> respuesta = new LinkedHashMap<>();
        respuesta.put("mensaje", "Inicio de sesión exitoso");
        respuesta.put("token", token);
        respuesta.put("idUsuario", usuario.getIdUsuario());
        respuesta.put("nombre", usuario.getNombre());
        respuesta.put("correo", usuario.getCorreo());
        respuesta.put("rol", usuario.getRol());

        return ResponseEntity.ok(respuesta);
    }

    // Endpoint público POST: http://localhost:8080/api/auth/registro
    @PostMapping("/registro")
    public ResponseEntity<Usuario> registrar(@RequestBody Usuario usuario) {
        Usuario nuevo = usuarioService.registrarUsuario(usuario);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevo);
    }
}