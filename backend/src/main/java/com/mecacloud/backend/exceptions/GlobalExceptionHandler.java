package com.mecacloud.backend.exceptions;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Intercepta errores de reglas de negocio (placas duplicadas, stock insuficiente, etc.)
    @ExceptionHandler({BusinessException.class, RuntimeException.class})
    public ResponseEntity<Map<String, Object>> manejarErrorNegocio(RuntimeException ex, HttpServletRequest request) {
        Map<String, Object> cuerpo = new LinkedHashMap<>();
        cuerpo.put("timestamp", LocalDateTime.now());
        cuerpo.put("status", HttpStatus.BAD_REQUEST.value());
        cuerpo.put("error", "Validación de Negocio");
        cuerpo.put("mensaje", ex.getMessage());
        cuerpo.put("ruta", request.getRequestURI());

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(cuerpo);
    }

    // Intercepta cualquier otro fallo técnico inesperado para no exponer código interno
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> manejarErrorGeneral(Exception ex, HttpServletRequest request) {
        Map<String, Object> cuerpo = new LinkedHashMap<>();
        cuerpo.put("timestamp", LocalDateTime.now());
        cuerpo.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        cuerpo.put("error", "Error Interno del Servidor");
        cuerpo.put("mensaje", "Ocurrió un error inesperado procesando la solicitud.");
        cuerpo.put("ruta", request.getRequestURI());

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(cuerpo);
    }
}