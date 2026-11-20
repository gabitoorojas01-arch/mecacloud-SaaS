import { useState, useEffect } from "react";
import { fetchConToken } from "../services/api";
import ModalNuevoRepuesto from "../components/ModalNuevoRepuesto";
import ModalAsignarRepuesto from "../components/ModalAsignarRepuesto";
import {
  Package,
  AlertTriangle,
  Plus,
  Search,
  ArrowUpCircle,
  Wrench,
  DollarSign,
} from "lucide-react";

export default function InventarioPage() {
  const [repuestos, setRepuestos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [soloAlertas, setSoloAlertas] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [modalNuevo, setModalNuevo] = useState(false);
  const [repuestoAsignar, setRepuestoAsignar] = useState(null);
  const [mensajeOk, setMensajeOk] = useState("");

  const cargarInventario = async () => {
    try {
      setCargando(true);
      const data = await fetchConToken("/inventario");
      setRepuestos(Array.isArray(data) ? data : []);
    } catch {
      setRepuestos([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarInventario();
  }, []);

  const mostrarNotificacion = (texto) => {
    setMensajeOk(texto);
    setTimeout(() => setMensajeOk(""), 3500);
  };

  const handleReabastecer = async (repuesto) => {
    const entrada = window.prompt(
      `¿Cuántas unidades deseas ingresar al stock de "${repuesto.nombre}"?`,
      "5",
    );
    const cantidad = Number(entrada);
    if (!entrada || isNaN(cantidad) || cantidad <= 0) return;

    try {
      await fetchConToken(`/inventario/${repuesto.idRepuesto}/reabastecer`, {
        method: "PATCH",
        body: JSON.stringify({ cantidad }),
      });
      mostrarNotificacion(
        `+${cantidad} unidades agregadas a ${repuesto.codigo}.`,
      );
      await cargarInventario();
    } catch (err) {
      alert(err.message || "Error al reabastecer el inventario.");
    }
  };

  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(valor || 0);
  };

  const totalAlertas = repuestos.filter((r) => r.alertaStockBajo).length;
  const valorTotalBodega = repuestos.reduce(
    (acc, r) => acc + Number(r.precioVenta || 0) * Number(r.stockActual || 0),
    0,
  );

  const repuestosFiltrados = repuestos.filter((r) => {
    const coincideTexto =
      r.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
      r.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const coincideFiltro = soloAlertas ? r.alertaStockBajo : true;
    return coincideTexto && coincideFiltro;
  });
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Inventario Inteligente
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Control de bodega, alertas de stock mínimo y carga a órdenes de
            trabajo
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalNuevo(true)}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Registrar Repuesto
        </button>
      </div>

      {mensajeOk && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm font-medium">
          {mensajeOk}
        </div>
      )}

      {/* Tarjetas de Indicadores (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase">
              Referencias en Bodega
            </p>
            <p className="text-2xl font-bold text-slate-900">
              {repuestos.length}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center ${
              totalAlertas > 0
                ? "bg-rose-50 text-rose-600"
                : "bg-emerald-50 text-emerald-600"
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase">
              Alertas Stock Bajo
            </p>
            <p
              className={`text-2xl font-bold ${totalAlertas > 0 ? "text-rose-600" : "text-slate-900"}`}
            >
              {totalAlertas}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase">
              Valorización Inventario
            </p>
            <p className="text-xl font-bold text-slate-900">
              {formatearMoneda(valorTotalBodega)}
            </p>
          </div>
        </div>
      </div>

      {/* Buscador y Filtro de Alertas */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm mb-6 flex flex-col sm:flex-row gap-3 justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por código o nombre de repuesto..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
          />
        </div>

        <button
          type="button"
          onClick={() => setSoloAlertas(!soloAlertas)}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border cursor-pointer transition-all ${
            soloAlertas
              ? "bg-rose-600 text-white border-rose-600"
              : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          {soloAlertas ? "Mostrando Solo Alertas" : "Filtrar Stock Bajo"}
        </button>
      </div>

      {/* Tabla Comercial de Bodega */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {cargando ? (
          <p className="text-sm text-slate-400 text-center py-10">
            Cargando inventario...
          </p>
        ) : repuestosFiltrados.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-10">
            No se encontraron repuestos con los filtros actuales.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                  <th className="py-3.5 px-5">Código</th>
                  <th className="py-3.5 px-5">Repuesto</th>
                  <th className="py-3.5 px-5 text-center">Stock / Mínimo</th>
                  <th className="py-3.5 px-5 text-right">Precio Venta</th>
                  <th className="py-3.5 px-5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {repuestosFiltrados.map((r) => (
                  <tr key={r.idRepuesto} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-5 font-mono text-xs font-bold text-slate-700">
                      {r.codigo}
                    </td>
                    <td className="py-3.5 px-5 font-medium text-slate-900">
                      {r.nombre}
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                          r.alertaStockBajo
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}
                      >
                        {r.alertaStockBajo && (
                          <AlertTriangle className="w-3.5 h-3.5" />
                        )}
                        {r.stockActual} / {r.stockMinimo} unid.
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right font-semibold text-slate-800">
                      {formatearMoneda(r.precioVenta)}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleReabastecer(r)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg cursor-pointer"
                        >
                          <ArrowUpCircle className="w-3.5 h-3.5" />
                          Surtiendo
                        </button>
                        <button
                          type="button"
                          onClick={() => setRepuestoAsignar(r)}
                          disabled={r.stockActual <= 0}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg cursor-pointer disabled:opacity-40"
                        >
                          <Wrench className="w-3.5 h-3.5" />
                          Cargar a Orden
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalNuevo && (
        <ModalNuevoRepuesto
          onCerrar={() => setModalNuevo(false)}
          onGuardado={async () => {
            setModalNuevo(false);
            mostrarNotificacion("Repuesto registrado correctamente en bodega.");
            await cargarInventario();
          }}
        />
      )}

      {repuestoAsignar && (
        <ModalAsignarRepuesto
          repuesto={repuestoAsignar}
          onCerrar={() => setRepuestoAsignar(null)}
          onAsignado={async () => {
            setRepuestoAsignar(null);
            mostrarNotificacion(
              "Repuesto cargado a la orden y stock descontado.",
            );
            await cargarInventario();
          }}
        />
      )}
    </div>
  );
}
