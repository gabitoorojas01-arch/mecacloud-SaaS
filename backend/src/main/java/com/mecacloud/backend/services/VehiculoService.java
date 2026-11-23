package com.mecacloud.backend.services;

import com.mecacloud.backend.repositories.OrdenTrabajoRepository;
import com.mecacloud.backend.models.Cliente;
import com.mecacloud.backend.models.Vehiculo;
import com.mecacloud.backend.repositories.ClienteRepository;
import com.mecacloud.backend.repositories.VehiculoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class VehiculoService {

    @Autowired
    private VehiculoRepository vehiculoRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    // Obtener todos los vehículos del taller
    public List<Vehiculo> obtenerTodos() {
        return vehiculoRepository.findAll();
    }

    // Buscar vehículo por placa (Pilar 1: Hoja de Vida)
    public Optional<Vehiculo> buscarPorPlaca(String placa) {
        String placaLimpia = placa.trim().toUpperCase();
        return vehiculoRepository.findById(placaLimpia);
    }

    // Registrar un vehículo nuevo validando placa única y cliente existente
    public Vehiculo registrarVehiculo(Vehiculo vehiculo) {
        // 1. Limpiar y pasar la placa a MAYÚSCULAS
        String placaFormateada = vehiculo.getPlaca().trim().toUpperCase();
        vehiculo.setPlaca(placaFormateada);

        // 2. Validar que la placa no exista ya en el sistema
        if (vehiculoRepository.existsById(placaFormateada)) {
            throw new RuntimeException("El vehículo con placa " + placaFormateada + " ya está registrado.");
        }

        // 3. Validar que el dueño (Cliente) exista en PostgreSQL
        Integer idCliente = vehiculo.getCliente().getIdCliente();
        Cliente clienteReal = clienteRepository.findById(idCliente)
                .orElseThrow(() -> new RuntimeException("El cliente con ID " + idCliente + " no existe."));

        vehiculo.setCliente(clienteReal);
        return vehiculoRepository.save(vehiculo);
    }
    @Autowired
    private OrdenTrabajoRepository ordenTrabajoRepository;

    // Eliminar vehículo por placa (validando que no tenga órdenes de trabajo registradas)
    public void eliminarVehiculo(String placa) {
        String placaLimpia = placa.trim().toUpperCase();
        Vehiculo vehiculo = vehiculoRepository.findById(placaLimpia)
                .orElseThrow(() -> new RuntimeException("No se encontró el vehículo con placa: " + placaLimpia));

        if (!ordenTrabajoRepository.findByVehiculoPlacaOrderByFechaIngresoDesc(placaLimpia).isEmpty()) {
            throw new RuntimeException("No se puede eliminar el vehículo " + placaLimpia + " porque tiene órdenes de trabajo registradas en su historial.");
        }

        vehiculoRepository.delete(vehiculo);
    }
}