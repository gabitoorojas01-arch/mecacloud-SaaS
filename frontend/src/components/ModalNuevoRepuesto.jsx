import { useState } from "react";
import { fetchConToken } from "../services/api";
import { X } from "lucide-react";

export default function ModalNuevoRepuesto({ onCerrar, onGuardado }) {
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    codigo: "",
    nombre: "",
    stockActual: 0,
    stockMinimo: 5,
    precioVenta: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setGuardando(true);

    try {
      await fetchConToken("/inventario", {
        method: "POST",
        body: JSON.stringify({
          codigo: form.codigo.trim().toUpperCase(),
          nombre: form.nombre.trim(),
          stockActual: Number(form.stockActual),
          stockMinimo: Number(form.stockMinimo),
          precioVenta: Number(form.precioVenta),
        }),
      });
      onGuardado();
    } catch (err) {
      setError(
        err.message ||
          "Error al registrar el repuesto. Verifica que el código no exista.",
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">
            Nuevo Repuesto en Bodega
          </h3>
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

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Código / Referencia *
            </label>
            <input
              type="text"
              required
              value={form.codigo}
              onChange={(e) =>
                setForm({ ...form, codigo: e.target.value.toUpperCase() })
              }
              placeholder="Ej: FIL-ACE-01"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Nombre del Repuesto *
            </label>
            <input
              type="text"
              required
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Ej: Filtro de Aceite Sintético"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Stock Inicial *
              </label>
              <input
                type="number"
                required
                min={0}
                value={form.stockActual}
                onChange={(e) =>
                  setForm({ ...form, stockActual: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Stock Mínimo *
              </label>
              <input
                type="number"
                required
                min={1}
                value={form.stockMinimo}
                onChange={(e) =>
                  setForm({ ...form, stockMinimo: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Precio de Venta (COP) *
            </label>
            <input
              type="number"
              required
              min={0}
              step="100"
              value={form.precioVenta}
              onChange={(e) =>
                setForm({ ...form, precioVenta: e.target.value })
              }
              placeholder="Ej: 45000"
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
              disabled={guardando}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl cursor-pointer disabled:opacity-60"
            >
              {guardando ? "Guardando..." : "Guardar Repuesto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
