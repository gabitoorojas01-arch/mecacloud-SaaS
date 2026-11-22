package com.mecacloud.backend.config;

import com.mecacloud.backend.models.Usuario;
import com.mecacloud.backend.repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (usuarioRepository.count() == 0) {
            Usuario adminInicial = new Usuario();
            adminInicial.setNombre("Gabriel Humberto Rojas Hernández");
            adminInicial.setCorreo("admin@mecacloud.com");
            adminInicial.setPassword(passwordEncoder.encode("Admin2026*"));
            adminInicial.setRol("ADMIN");

            usuarioRepository.save(adminInicial);
            System.out.println(">>> [MecaCloud SaaS] Usuario ADMIN inicial creado: admin@mecacloud.com");
        }
    }
}