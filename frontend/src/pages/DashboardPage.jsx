import { useState, useEffect } from "react";
import { fetchConToken } from "../services/api";
import {
  DollarSign,
  Car,
  AlertTriangle,
  Wrench,
  TrendingUp,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Package,
} from "lucide-react";

export default function DashboardPage({ setVistaActiva }) {
  const [datos, setDatos] = useState({
    ordenes: [],
    vehiculos: [],
    repuestos: [],
    usuarios: [],
    totalFacturado: 0,
  });
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarMetricas = async () => {
      try {
        const [ordenes, vehiculos, inventario, usuarios] = await Promise.all([
          fetchConToken("/ordenes"),
          fetchConToken("/vehiculos"),
          fetchConToken("/inventario"),
          fetchConToken("/usuarios"),
        ]);

        const listaOrdenes = ordenes || [];
        const terminadas = listaOrdenes.filter((o) => o.estado === "TERMINADO");

        const detallesPorOrden = await Promise.all(
          terminadas.map((o) =>
            fetchConToken(`/inventario/orden/${o.idOrden}`).catch(() => []),
          ),
        );

        const sumaRepuestos = detallesPorOrden
          .flat()
          .reduce(
            (acc, d) =>
              acc + Number(d.precioUnitario || 0) * Number(d.cantidad || 0),
            0,
          );

        setDatos({
          ordenes: listaOrdenes,
          vehiculos: vehiculos || [],
          repuestos: inventario || [],
          usuarios: usuarios || [],
          totalFacturado: sumaRepuestos,
        });
      } catch (error) {
        console.error("Error cargando métricas gerenciales:", error.message);
      } finally {
        setCargando(false);
      }
    };

    cargarMetricas();
  }, []);

  if (cargando) {
    return (
      <div className="p-8 text-slate-500 text-sm">
        Calculando indicadores gerenciales...
      </div>
    );
  }

  // --- CÁLCULOS DE NEGOCIO EN TIEMPO REAL ---
  const ordenesPendientes = datos.ordenes.filter(
    (o) => o.estado === "PENDIENTE",
  );
  const ordenesEnProgreso = datos.ordenes.filter(
    (o) => o.estado === "EN_PROGRESO",
  );
  const ordenesTerminadas = datos.ordenes.filter(
    (o) => o.estado === "TERMINADO",
  );

  const vehiculosEnPatio = ordenesPendientes.length + ordenesEnProgreso.length;
  const ingresosTotales = datos.totalFacturado || 0;

  // Alertas de inventario bajo (soporta distintos nombres de campo estándar)
  const repuestosBajos = datos.repuestos.filter((r) => {
    const actual = Number(r.stockActual ?? r.stock ?? r.cantidad ?? 0);
    const minimo = Number(r.stockMinimo ?? r.minimo ?? 5);
    return actual <= minimo;
  });

  const mecanicosActivos = datos.usuarios.filter(
    (u) => u.rol === "MECANICO",
  ).length;

  const totalOrdenes = datos.ordenes.length || 1;
  const pctPendiente = Math.round(
    (ordenesPendientes.length / totalOrdenes) * 100,
  );
  const pctProgreso = Math.round(
    (ordenesEnProgreso.length / totalOrdenes) * 100,
  );
  const pctTerminado = Math.round(
    (ordenesTerminadas.length / totalOrdenes) * 100,
  );

  const ultimasOrdenes = [...datos.ordenes]
    .sort((a, b) => (b.idOrden || 0) - (a.idOrden || 0))
    .slice(0, 5);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Encabezado Ejecutivo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Panel Gerencial MecaCloud
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Resumen operativo, financiero y de inventario en tiempo real
          </p>
        </div>
        <button
          onClick={() => setVistaActiva("kanban")}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl shadow-sm shadow-indigo-200 flex items-center gap-2 transition cursor-pointer self-start"
        >
          <span>Ir al Tablero Operativo</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* Tarjetas KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Ingresos Facturados
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-3">
            ${ingresosTotales.toLocaleString("es-CO")}
          </p>
          <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            {ordenesTerminadas.length} órdenes liquidadas
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Vehículos en Patio
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Wrench className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-3">
            {vehiculosEnPatio}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {ordenesEnProgreso.length} en reparación ·{" "}
            {ordenesPendientes.length} en espera
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Alertas de Stock
            </span>
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                repuestosBajos.length > 0
                  ? "bg-amber-50 text-amber-600"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-3">
            {repuestosBajos.length}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            De {datos.repuestos.length} referencias en almacén
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Flota & Equipo
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Car className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-3">
            {datos.vehiculos.length}{" "}
            <span className="text-sm font-normal text-slate-400">
              vehículos
            </span>
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {mecanicosActivos} técnicos activos en taller
          </p>
        </div>
      </div>

      {/* Flujo Operativo del Taller */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Distribución del Flujo Operativo
            </h3>
            <p className="text-xs text-slate-500">
              Porcentaje de órdenes según su etapa actual en el taller
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
            Total: {datos.ordenes.length} órdenes
          </span>
        </div>

        {/* Barra de progreso segmentada */}
        <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex">
          <div
            style={{ width: `${pctPendiente}%` }}
            className="bg-slate-400 transition-all duration-500"
            title={`Pendientes: ${pctPendiente}%`}
          />
          <div
            style={{ width: `${pctProgreso}%` }}
            className="bg-indigo-600 transition-all duration-500"
            title={`En Reparación: ${pctProgreso}%`}
          />
          <div
            style={{ width: `${pctTerminado}%` }}
            className="bg-emerald-500 transition-all duration-500"
            title={`Terminadas: ${pctTerminado}%`}
          />
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
            <span className="text-slate-600">
              Pendientes:{" "}
              <strong className="text-slate-900">
                {ordenesPendientes.length}
              </strong>{" "}
              ({pctPendiente}%)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
            <span className="text-slate-600">
              En Reparación:{" "}
              <strong className="text-slate-900">
                {ordenesEnProgreso.length}
              </strong>{" "}
              ({pctProgreso}%)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-600">
              Listas:{" "}
              <strong className="text-slate-900">
                {ordenesTerminadas.length}
              </strong>{" "}
              ({pctTerminado}%)
            </span>
          </div>
        </div>
      </div>
      {/* Tablas de Resumen Inferior */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Últimas Órdenes */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">
              Actividad Reciente en Taller
            </h3>
            <button
              onClick={() => setVistaActiva("kanban")}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
            >
              Ver tablero →
            </button>
          </div>

          {ultimasOrdenes.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              Aún no hay órdenes registradas.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {ultimasOrdenes.map((orden) => (
                <div
                  key={orden.idOrden}
                  className="py-3 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-slate-900 text-white text-xs font-bold rounded">
                        {orden.vehiculo?.placa}
                      </span>
                      <span className="text-sm font-semibold text-slate-800">
                        {orden.vehiculo?.marca} {orden.vehiculo?.modelo}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                      {orden.descripcionFalla}
                    </p>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 flex items-center gap-1 ${
                      orden.estado === "TERMINADO"
                        ? "bg-emerald-50 text-emerald-700"
                        : orden.estado === "EN_PROGRESO"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {orden.estado === "TERMINADO" ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <Clock className="w-3 h-3" />
                    )}
                    {orden.estado === "TERMINADO"
                      ? "Listo"
                      : orden.estado === "EN_PROGRESO"
                        ? "En curso"
                        : "Pendiente"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Repuestos Críticos */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">
              Alertas de Reposición de Inventario
            </h3>
            <button
              onClick={() => setVistaActiva("inventario")}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
            >
              Ir a inventario →
            </button>
          </div>

          {repuestosBajos.length === 0 ? (
            <div className="py-8 text-center">
              <Package className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
              <p className="text-sm font-medium text-slate-700">
                Stock saludable
              </p>
              <p className="text-xs text-slate-400">
                Ningún repuesto está por debajo del mínimo configurado.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {repuestosBajos.slice(0, 5).map((rep) => {
                const actual =
                  rep.stockActual ?? rep.stock ?? rep.cantidad ?? 0;
                const minimo = rep.stockMinimo ?? rep.minimo ?? 5;
                return (
                  <div
                    key={rep.idRepuesto || rep.id}
                    className="py-3 flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {rep.nombre}
                      </p>
                      <p className="text-xs text-slate-400">
                        Código: {rep.codigo || "N/A"} · Mínimo requerido:{" "}
                        {minimo}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
                      Quedan {actual} und.
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
