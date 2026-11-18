package com.mecacloud.backend.services;

import com.mecacloud.backend.models.Cliente;
import com.mecacloud.backend.repositories.ClienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ClienteService {

    @Autowired
    private ClienteRepository clienteRepository;

    // Listar todos los clientes registrados en el taller
    public List<Cliente> obtenerTodos() {
        return clienteRepository.findAll();
    }

    // Buscar un cliente por su ID interno
    public Optional<Cliente> obtenerPorId(Integer id) {
        return clienteRepository.findById(id);
    }

    // Buscar un cliente por su número de cédula o NIT
    public Optional<Cliente> obtenerPorDocumento(String numeroDocumento) {
        return clienteRepository.findByNumeroDocumento(numeroDocumento);
    }

    // Registrar un nuevo cliente validando que no esté repetido
    public Cliente guardarCliente(Cliente cliente) {
        Optional<Cliente> existente = clienteRepository.findByNumeroDocumento(cliente.getNumeroDocumento());
        if (existente.isPresent()) {
            throw new RuntimeException("Ya existe un cliente registrado con el documento: " + cliente.getNumeroDocumento());
        }
        return clienteRepository.save(cliente);
    }
}