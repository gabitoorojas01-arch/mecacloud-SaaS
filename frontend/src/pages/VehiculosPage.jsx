import { useState, useEffect } from "react";
import { fetchConToken } from "../services/api";
import ModalRegistroVehiculo from "../components/ModalRegistroVehiculo";
import {
  Search,
  Car,
  User,
  Phone,
  Mail,
  FileText,
  Plus,
  Wrench,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  Trash2,
} from "lucide-react";

export default function VehiculosPage() {
  const [vehiculos, setVehiculos] = useState([]);
  const [busquedaPlaca, setBusquedaPlaca] = useState("");
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState(null);
  const [historialOrdenes, setHistorialOrdenes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [cargandoLista, setCargandoLista] = useState(true);
  const [errorBusqueda, setErrorBusqueda] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  useEffect(() => {
    cargarVehiculos();
  }, []);

  const cargarVehiculos = async () => {
    try {
      setCargandoLista(true);
      const data = await fetchConToken("/vehiculos");
      setVehiculos(Array.isArray(data) ? data : []);
    } catch {
      setVehiculos([]);
    } finally {
      setCargandoLista(false);
    }
  };
  const usuarioActual = JSON.parse(
    localStorage.getItem("mecacloud_usuario") || "{}",
  );
  const esAdmin = usuarioActual?.rol === "ADMIN";

  const eliminarVehiculo = async (placa) => {
    const confirmar = window.confirm(
      `¿Seguro que deseas eliminar el vehículo con placa ${placa}? Esta acción no se puede deshacer.`,
    );
    if (!confirmar) return;

    try {
      await fetchConToken(`/vehiculos/${placa}`, {
        method: "DELETE",
      });
      setVehiculoSeleccionado(null);
      setHistorialOrdenes([]);
      cargarVehiculos();
    } catch (error) {
      alert(error.message);
    }
  };

  const seleccionarVehiculo = async (vehiculo) => {
    setErrorBusqueda("");
    setVehiculoSeleccionado(vehiculo);
    setBusquedaPlaca(vehiculo.placa);
    setCargando(true);
    try {
      const ordenes = await fetchConToken(
        `/ordenes/vehiculo/${vehiculo.placa.toUpperCase()}`,
      );
      const ordenadas = Array.isArray(ordenes)
        ? [...ordenes].sort(
            (a, b) => new Date(b.fechaIngreso) - new Date(a.fechaIngreso),
          )
        : [];
      setHistorialOrdenes(ordenadas);
    } catch {
      setHistorialOrdenes([]);
    } finally {
      setCargando(false);
    }
  };

  const handleBuscarPlaca = async (e) => {
    e.preventDefault();
    const placaLimpia = busquedaPlaca.trim().toUpperCase();
    if (!placaLimpia) return;
    setErrorBusqueda("");
    setCargando(true);

    const encontradoLocal = vehiculos.find(
      (v) => v.placa.toUpperCase() === placaLimpia,
    );
    if (encontradoLocal) {
      await seleccionarVehiculo(encontradoLocal);
      return;
    }

    try {
      const vehiculoApi = await fetchConToken(`/vehiculos/${placaLimpia}`);
      await seleccionarVehiculo(vehiculoApi);
    } catch {
      setVehiculoSeleccionado(null);
      setHistorialOrdenes([]);
      setErrorBusqueda(
        `No se encontró ningún vehículo con la placa "${placaLimpia}".`,
      );
      setCargando(false);
    }
  };

  const formatearFecha = (fechaIso) => {
    if (!fechaIso) return "Pendiente";
    return new Date(fechaIso).toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const obtenerBadgeEstado = (estado) => {
    if (estado === "PENDIENTE")
      return "bg-amber-50 text-amber-700 border-amber-200";
    if (estado === "EN_REPARACION")
      return "bg-indigo-50 text-indigo-700 border-indigo-200";
    if (estado === "LISTO" || estado === "ENTREGADO")
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Hoja de Vida Vehicular
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Historial clínico de reparaciones por placa
            </p>
          </div>
          <button
            type="button"
            onClick={() => setModalAbierto(true)}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Registrar Vehículo / Cliente
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm mb-6">
        <form
          onSubmit={handleBuscarPlaca}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={busquedaPlaca}
              onChange={(e) => setBusquedaPlaca(e.target.value.toUpperCase())}
              placeholder="Ingresa la placa (Ej: ABC123)..."
              maxLength={10}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold uppercase"
            />
          </div>
          <button
            type="submit"
            disabled={cargando}
            className="bg-slate-900 text-white text-sm font-medium px-6 py-2.5 rounded-xl cursor-pointer"
          >
            {cargando ? "Consultando..." : "Consultar Historial"}
          </button>
        </form>
        {errorBusqueda && (
          <div className="mt-4 flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorBusqueda}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm h-fit">
          <h2 className="text-sm font-semibold text-slate-800 uppercase mb-4">
            Parque Automotor ({vehiculos.length})
          </h2>
          {cargandoLista ? (
            <p className="text-sm text-slate-400 py-6 text-center">
              Cargando...
            </p>
          ) : vehiculos.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">
              Sin vehículos registrados.
            </p>
          ) : (
            <div className="space-y-2.5">
              {vehiculos.map((v) => (
                <button
                  type="button"
                  key={v.placa}
                  onClick={() => seleccionarVehiculo(v)}
                  className={`w-full text-left p-3.5 rounded-xl border cursor-pointer ${
                    vehiculoSeleccionado?.placa === v.placa
                      ? "bg-indigo-50 border-indigo-500"
                      : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="flex justify-between">
                    <span className="bg-slate-900 text-white text-xs font-bold px-2.5 py-1 rounded-md">
                      {v.placa}
                    </span>
                    <span className="text-xs text-slate-500">{v.anio}</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800 mt-2">
                    {v.marca} {v.modelo}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Propietario: {v.cliente?.nombre}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="lg:col-span-8">
          {!vehiculoSeleccionado ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
              <Car className="w-8 h-8 text-indigo-600 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-800">
                Selecciona o busca un vehículo
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Haz clic en una placa de la lista izquierda para ver su hoja de
                vida.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex justify-between items-start pb-5 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="bg-slate-900 text-white text-base font-extrabold px-3.5 py-1 rounded-lg">
                        {vehiculoSeleccionado.placa}
                      </span>
                      <h2 className="text-xl font-bold text-slate-900">
                        {vehiculoSeleccionado.marca}{" "}
                        {vehiculoSeleccionado.modelo}
                      </h2>
                    </div>
                    <p className="text-sm text-slate-500 mt-1.5">
                      Línea: {vehiculoSeleccionado.linea || "Estándar"} • Año:{" "}
                      {vehiculoSeleccionado.anio}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/70 px-3 py-1 rounded-full text-xs font-semibold">
                      <ShieldCheck className="w-4 h-4" /> Verificado
                    </span>
                    {esAdmin && (
                      <button
                        type="button"
                        onClick={() =>
                          eliminarVehiculo(vehiculoSeleccionado.placa)
                        }
                        title="Eliminar vehículo"
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl border border-slate-200/70 transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="pt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl mt-4">
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-indigo-600" />
                    <div>
                      <p className="text-xs text-slate-400">Propietario</p>
                      <p className="text-sm font-semibold text-slate-800">
                        {vehiculoSeleccionado.cliente?.nombre}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    <div>
                      <p className="text-xs text-slate-400">Documento</p>
                      <p className="text-sm font-medium text-slate-700">
                        {vehiculoSeleccionado.cliente?.tipoDocumento}{" "}
                        {vehiculoSeleccionado.cliente?.numeroDocumento}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-indigo-600" />
                    <div>
                      <p className="text-xs text-slate-400">Teléfono</p>
                      <p className="text-sm font-medium text-slate-700">
                        {vehiculoSeleccionado.cliente?.telefono || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-indigo-600" />
                    <div>
                      <p className="text-xs text-slate-400">Correo</p>
                      <p className="text-sm font-medium text-slate-700">
                        {vehiculoSeleccionado.cliente?.correo || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-base font-bold text-slate-900">
                      Historial Clínico ({historialOrdenes.length})
                    </h3>
                  </div>
                </div>

                {cargando ? (
                  <p className="text-sm text-slate-400 text-center py-6">
                    Cargando historial...
                  </p>
                ) : historialOrdenes.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-6">
                    Sin órdenes registradas.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {historialOrdenes.map((orden) => (
                      <div
                        key={orden.idOrden}
                        className="bg-slate-50 rounded-xl border border-slate-200 p-4"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold text-slate-600">
                            Orden #{orden.idOrden}
                          </span>
                          <span
                            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${obtenerBadgeEstado(orden.estado)}`}
                          >
                            {orden.estado}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-slate-800">
                          {orden.descripcionFalla}
                        </p>
                        <div className="flex justify-between text-xs text-slate-500 mt-3 pt-2 border-t border-slate-200">
                          <span>
                            Mecánico:{" "}
                            <strong>
                              {orden.mecanico?.nombre || "Sin asignar"}
                            </strong>
                          </span>
                          <span>
                            Ingreso: {formatearFecha(orden.fechaIngreso)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      {modalAbierto && (
        <ModalRegistroVehiculo
          placaInicial={busquedaPlaca.trim().toUpperCase()}
          onCerrar={() => setModalAbierto(false)}
          onRegistroExitoso={async (nuevoVehiculo) => {
            setModalAbierto(false);
            await cargarVehiculos();
            await seleccionarVehiculo(nuevoVehiculo);
          }}
        />
      )}
    </div>
  );
}
