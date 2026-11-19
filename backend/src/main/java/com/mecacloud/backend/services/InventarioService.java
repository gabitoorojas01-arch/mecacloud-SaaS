package com.mecacloud.backend.services;

import com.mecacloud.backend.models.DetalleOrden;
import com.mecacloud.backend.models.OrdenTrabajo;
import com.mecacloud.backend.models.Repuesto;
import com.mecacloud.backend.repositories.DetalleOrdenRepository;
import com.mecacloud.backend.repositories.OrdenTrabajoRepository;
import com.mecacloud.backend.repositories.RepuestoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class InventarioService {

    @Autowired
    private RepuestoRepository repuestoRepository;

    @Autowired
    private DetalleOrdenRepository detalleOrdenRepository;

    @Autowired
    private OrdenTrabajoRepository ordenTrabajoRepository;

    // Listar todo el inventario de la bodega
    public List<Repuesto> obtenerTodos() {
        return repuestoRepository.findAll();
    }

    // Obtener únicamente los repuestos en alerta roja (stock <= mínimo)
    public List<Repuesto> obtenerAlertasStockBajo() {
        return repuestoRepository.findRepuestosConStockBajo();
    }

    // Registrar un repuesto nuevo en bodega
    public Repuesto registrarRepuesto(Repuesto repuesto) {
        String codigoLimpio = repuesto.getCodigo().trim().toUpperCase();
        if (repuestoRepository.findByCodigo(codigoLimpio).isPresent()) {
            throw new RuntimeException("Ya existe un repuesto registrado con el código: " + codigoLimpio);
        }
        repuesto.setCodigo(codigoLimpio);
        return repuestoRepository.save(repuesto);
    }

    // Reabastecer stock cuando llega mercancía de proveedores
    public Repuesto agregarStock(Integer idRepuesto, Integer cantidadAgregar) {
        if (cantidadAgregar == null || cantidadAgregar <= 0) {
            throw new RuntimeException("La cantidad a ingresar debe ser mayor a cero.");
        }
        Repuesto repuesto = repuestoRepository.findById(idRepuesto)
                .orElseThrow(() -> new RuntimeException("No se encontró el repuesto con ID: " + idRepuesto));

        repuesto.setStockActual(repuesto.getStockActual() + cantidadAgregar);
        return repuestoRepository.save(repuesto);
    }

    // Asignar repuesto a una orden de trabajo y descontar inventario automáticamente
    @Transactional
    public DetalleOrden asignarRepuestoAOrden(Integer idOrden, Integer idRepuesto, Integer cantidad) {
        if (cantidad == null || cantidad <= 0) {
            throw new RuntimeException("La cantidad utilizada debe ser mayor a cero.");
        }

        OrdenTrabajo orden = ordenTrabajoRepository.findById(idOrden)
                .orElseThrow(() -> new RuntimeException("No existe la orden de trabajo #" + idOrden));

        Repuesto repuesto = repuestoRepository.findById(idRepuesto)
                .orElseThrow(() -> new RuntimeException("No existe el repuesto con ID: " + idRepuesto));

        // Validación crítica: evitar stock negativo
        if (repuesto.getStockActual() < cantidad) {
            throw new RuntimeException("Stock insuficiente para '" + repuesto.getNombre() + 
                    "'. Disponible: " + repuesto.getStockActual() + ", solicitado: " + cantidad);
        }

        // 1. Descontar del inventario
        repuesto.setStockActual(repuesto.getStockActual() - cantidad);
        repuestoRepository.save(repuesto);

        // 2. Registrar el consumo en la orden congelando el precio actual
        DetalleOrden detalle = new DetalleOrden();
        detalle.setOrdenTrabajo(orden);
        detalle.setRepuesto(repuesto);
        detalle.setCantidad(cantidad);
        detalle.setPrecioUnitario(repuesto.getPrecioVenta());

        return detalleOrdenRepository.save(detalle);
    }

    // Consultar qué repuestos se han gastado en una orden específica
    public List<DetalleOrden> obtenerDetallesPorOrden(Integer idOrden) {
        return detalleOrdenRepository.findByOrdenTrabajoIdOrden(idOrden);
    }
}