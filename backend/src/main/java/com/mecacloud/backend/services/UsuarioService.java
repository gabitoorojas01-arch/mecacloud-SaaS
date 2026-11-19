package com.mecacloud.backend.services;

import com.mecacloud.backend.models.Usuario;
import com.mecacloud.backend.repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Listar todos los empleados del taller
    public List<Usuario> obtenerTodos() {
        return usuarioRepository.findAll();
    }

    // Listar empleados por rol (ej. traer solo MECANICO)
    public List<Usuario> obtenerPorRol(String rol) {
        return usuarioRepository.findByRol(rol.trim().toUpperCase());
    }

    // Buscar usuario por correo
    public Optional<Usuario> buscarPorCorreo(String correo) {
        return usuarioRepository.findByCorreo(correo.trim().toLowerCase());
    }

    // Registrar un usuario nuevo encriptando su contraseña con BCrypt
    public Usuario registrarUsuario(Usuario usuario) {
        String correoLimpio = usuario.getCorreo().trim().toLowerCase();
        
        if (usuarioRepository.findByCorreo(correoLimpio).isPresent()) {
            throw new RuntimeException("Ya existe un usuario registrado con el correo: " + correoLimpio);
        }

        usuario.setCorreo(correoLimpio);
        usuario.setRol(usuario.getRol().trim().toUpperCase());
        
        // Encriptación irreversible BCrypt antes de guardar en PostgreSQL
        String passwordEncriptada = passwordEncoder.encode(usuario.getPassword());
        usuario.setPassword(passwordEncriptada);

        return usuarioRepository.save(usuario);
    }
}