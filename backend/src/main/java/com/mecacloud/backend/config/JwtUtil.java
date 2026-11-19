package com.mecacloud.backend.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {

    // Llave secreta de 256 bits para firmar los tokens (en producción va en variables de entorno)
    private static final String SECRET_STRING = "MecaCloudSaaS_ClaveSecretaSuperSegura_2026_Bogota_Colombia!";
    private static final long EXPIRATION_TIME = 86400000; // 24 horas en milisegundos

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET_STRING.getBytes(StandardCharsets.UTF_8));
    }

    // Genera un token firmado incluyendo el correo y el rol del usuario
    public String generarToken(String correo, String rol) {
        return Jwts.builder()
                .subject(correo)
                .claim("rol", rol)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(getSigningKey())
                .compact();
    }

    // Extrae el correo del usuario desde el token
    public String extraerCorreo(String token) {
        return extraerClaims(token).getSubject();
    }

    // Extrae el rol del usuario desde el token
    public String extraerRol(String token) {
        return extraerClaims(token).get("rol", String.class);
    }

    // Verifica que el token sea auténtico y no haya expirado
    public boolean validarToken(String token) {
        try {
            extraerClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private Claims extraerClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}