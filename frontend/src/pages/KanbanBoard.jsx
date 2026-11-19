import { useState, useEffect } from "react";
import { fetchConToken } from "../services/api";
import {
  Plus,
  User,
  Calendar,
  ArrowRight,
  CheckCircle2,
  Clock,
  Wrench,
  X,
} from "lucide-react";

export default function KanbanBoard() {
  const [ordenes, setOrdenes] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [mecanicos, setMecanicos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);

  const [placaSeleccionada, setPlacaSeleccionada] = useState("");
  const [mecanicoSeleccionado, setMecanicoSeleccionado] = useState("");
  const [descripcionFalla, setDescripcionFalla] = useState("");
  const [errorModal, setErrorModal] = useState("");

  const cargarDatos = async () => {
    try {
      const [listaOrdenes, listaVehiculos, listaMecanicos] = await Promise.all([
        fetchConToken("/ordenes"),
        fetchConToken("/vehiculos"),
        fetchConToken("/usuarios/rol/MECANICO"),
      ]);
      setOrdenes(listaOrdenes);
      setVehiculos(listaVehiculos);
      setMecanicos(listaMecanicos);
    } catch (error) {
      console.error("Error cargando tablero:", error.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const cambiarEstadoOrden = async (idOrden, nuevoEstado) => {
    try {
      await fetchConToken(`/ordenes/${idOrden}/estado`, {
        method: "PATCH",
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      cargarDatos();
    } catch (error) {
      alert(error.message);
    }
  };

  const crearNuevaOrden = async (e) => {
    e.preventDefault();
    setErrorModal("");
    try {
      await fetchConToken("/ordenes", {
        method: "POST",
        body: JSON.stringify({
          vehiculo: { placa: placaSeleccionada },
          mecanico: mecanicoSeleccionado
            ? { idUsuario: Number(mecanicoSeleccionado) }
            : null,
          descripcionFalla,
        }),
      });
      setMostrarModal(false);
      setPlacaSeleccionada("");
      setMecanicoSeleccionado("");
      setDescripcionFalla("");
      cargarDatos();
    } catch (error) {
      setErrorModal(error.message);
    }
  };

  const columnas = [
    {
      id: "PENDIENTE",
      titulo: "Pendiente de Ingreso",
      icono: Clock,
      badge: "bg-slate-100 text-slate-700",
      borde: "border-slate-200",
    },
    {
      id: "EN_PROGRESO",
      titulo: "En Reparación",
      icono: Wrench,
      badge: "bg-blue-50 text-blue-700",
      borde: "border-blue-200/70",
    },
    {
      id: "TERMINADO",
      titulo: "Listo para Entrega",
      icono: CheckCircle2,
      badge: "bg-emerald-50 text-emerald-700",
      borde: "border-emerald-200/70",
    },
  ];

  if (cargando) {
    return (
      <div className="p-8 text-slate-500 text-sm">
        Cargando tablero operativo...
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Tablero Operativo Kanban
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Control visual en tiempo real de los vehículos en patio
          </p>
        </div>
        <button
          onClick={() => setMostrarModal(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl shadow-sm shadow-indigo-200 flex items-center gap-2 transition cursor-pointer self-start"
        >
          <Plus className="w-4 h-4" />
          Nueva Orden de Trabajo
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {columnas.map((col) => {
          const IconoCol = col.icono;
          const tarjetas = ordenes.filter((o) => o.estado === col.id);

          return (
            <div
              key={col.id}
              className="bg-slate-100/70 rounded-2xl p-4 border border-slate-200/60 flex flex-col"
            >
              <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                  <IconoCol className="w-4 h-4 text-slate-600" />
                  <h3 className="font-semibold text-slate-800 text-sm">
                    {col.titulo}
                  </h3>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${col.badge}`}
                >
                  {tarjetas.length}
                </span>
              </div>

              <div className="space-y-3 flex-1">
                {tarjetas.length === 0 ? (
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center text-xs text-slate-400">
                    Sin vehículos en esta etapa
                  </div>
                ) : (
                  tarjetas.map((orden) => (
                    <div
                      key={orden.idOrden}
                      className={`bg-white rounded-xl p-4 shadow-sm border ${col.borde} hover:shadow-md transition`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2.5 py-1 bg-slate-900 text-white text-xs font-bold tracking-wider rounded-lg">
                          {orden.vehiculo.placa}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          Orden #{orden.idOrden}
                        </span>
                      </div>

                      <p className="text-sm font-semibold text-slate-800">
                        {orden.vehiculo.marca} {orden.vehiculo.modelo} (
                        {orden.vehiculo.anio})
                      </p>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {orden.descripcionFalla}
                      </p>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-indigo-500" />
                          {orden.mecanico
                            ? orden.mecanico.nombre
                            : "Sin asignar"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(orden.fechaIngreso).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="mt-3 flex gap-2">
                        {col.id === "PENDIENTE" && (
                          <button
                            onClick={() =>
                              cambiarEstadoOrden(orden.idOrden, "EN_PROGRESO")
                            }
                            className="w-full py-1.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer"
                          >
                            Iniciar Reparación
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {col.id === "EN_PROGRESO" && (
                          <button
                            onClick={() =>
                              cambiarEstadoOrden(orden.idOrden, "TERMINADO")
                            }
                            className="w-full py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer"
                          >
                            Marcar Terminado
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {mostrarModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                Ingresar Vehículo al Taller
              </h3>
              <button
                onClick={() => setMostrarModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorModal && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">
                {errorModal}
              </div>
            )}

            <form onSubmit={crearNuevaOrden} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Vehículo (Placa)
                </label>
                <select
                  required
                  value={placaSeleccionada}
                  onChange={(e) => setPlacaSeleccionada(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600"
                >
                  <option value="">Selecciona un vehículo...</option>
                  {vehiculos.map((v) => (
                    <option key={v.placa} value={v.placa}>
                      {v.placa} - {v.marca} {v.modelo} ({v.cliente.nombre})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mecánico Asignado
                </label>
                <select
                  value={mecanicoSeleccionado}
                  onChange={(e) => setMecanicoSeleccionado(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="">Selecciona un mecánico...</option>
                  {mecanicos.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setMostrarModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
