import { useState, useEffect } from "react";
import { fetchConToken } from "../services/api";
import { X, Wrench } from "lucide-react";

export default function ModalAsignarRepuesto({
  repuesto,
  onCerrar,
  onAsignado,
}) {
  const [ordenes, setOrdenes] = useState([]);
  const [cargandoOrdenes, setCargandoOrdenes] = useState(true);
  const [idOrden, setIdOrden] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarOrdenes = async () => {
      try {
        const data = await fetchConToken("/ordenes");
        const lista = Array.isArray(data) ? data : [];
        setOrdenes(lista);
        if (lista.length > 0) {
          setIdOrden(lista[0].idOrden);
        }
      } catch {
        setOrdenes([]);
      } finally {
        setCargandoOrdenes(false);
      }
    };
    cargarOrdenes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setEnviando(true);

    try {
      await fetchConToken("/inventario/asignar-orden", {
        method: "POST",
        body: JSON.stringify({
          idOrden: Number(idOrden),
          idRepuesto: repuesto.idRepuesto,
          cantidad: Number(cantidad),
        }),
      });
      onAsignado();
    } catch (err) {
      setError(
        err.message ||
          "No se pudo asignar el repuesto. Verifica el stock disponible.",
      );
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-slate-900">
              Cargar Repuesto a Orden
            </h3>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
            <p className="text-xs text-slate-500">Repuesto seleccionado</p>
            <p className="text-sm font-bold text-slate-900 mt-0.5">
              {repuesto.codigo} — {repuesto.nombre}
            </p>
            <p className="text-xs text-emerald-700 font-medium mt-1">
              Disponible en bodega: {repuesto.stockActual} unidades
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Orden de Trabajo Destino *
            </label>
            {cargandoOrdenes ? (
              <p className="text-xs text-slate-400">Cargando órdenes...</p>
            ) : ordenes.length === 0 ? (
              <p className="text-xs text-rose-600">
                No hay órdenes de trabajo creadas.
              </p>
            ) : (
              <select
                required
                value={idOrden}
                onChange={(e) => setIdOrden(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800"
              >
                {ordenes.map((o) => (
                  <option key={o.idOrden} value={o.idOrden}>
                    Orden #{o.idOrden} — {o.vehiculo?.placa} ({o.estado})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Cantidad a descontar *
            </label>
            <input
              type="number"
              required
              min={1}
              max={repuesto.stockActual}
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onCerrar}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={
                enviando || ordenes.length === 0 || repuesto.stockActual <= 0
              }
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl cursor-pointer disabled:opacity-60"
            >
              {enviando ? "Asignando..." : "Confirmar Carga"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
