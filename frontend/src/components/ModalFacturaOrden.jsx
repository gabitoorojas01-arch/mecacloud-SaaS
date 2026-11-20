import { useState, useEffect } from "react";
import { fetchConToken } from "../services/api";
import { X, Printer, FileText, Car, User, Wrench } from "lucide-react";

export default function ModalFacturaOrden({ orden, onCerrar }) {
  const [detalles, setDetalles] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [manoObra, setManoObra] = useState(0);

  useEffect(() => {
    const cargarRepuestosOrden = async () => {
      try {
        setCargando(true);
        const data = await fetchConToken(`/inventario/orden/${orden.idOrden}`);
        setDetalles(Array.isArray(data) ? data : []);
      } catch {
        setDetalles([]);
      } finally {
        setCargando(false);
      }
    };
    cargarRepuestosOrden();
  }, [orden.idOrden]);

  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(valor || 0);
  };

  const subtotalRepuestos = detalles.reduce(
    (acc, item) =>
      acc + Number(item.precioUnitario || 0) * Number(item.cantidad || 0),
    0,
  );
  const totalGeneral = subtotalRepuestos + Number(manoObra || 0);

  const imprimirPDF = () => {
    window.print();
  };
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Barra Superior (No se imprime) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-slate-900">
              Liquidación y Factura — Orden #{orden.idOrden}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={imprimirPDF}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-xl cursor-pointer shadow-sm"
            >
              <Printer className="w-4 h-4" />
              Imprimir / Guardar PDF
            </button>
            <button
              type="button"
              onClick={onCerrar}
              className="p-1.5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Documento Imprimible */}
        <div id="zona-factura-pdf" className="p-8 space-y-6">
          {/* Encabezado de Empresa */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-5">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                MecaCloud SaaS
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Centro de Servicio Automotriz • Bogotá D.C., Colombia
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Comprobante Técnico y Liquidación de Servicio
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block bg-slate-900 text-white text-xs font-bold px-3 py-1 rounded-lg">
                ORDEN #{orden.idOrden}
              </span>
              <p className="text-xs text-slate-500 mt-2">
                Fecha: {new Date().toLocaleDateString("es-CO")}
              </p>
              <p className="text-xs font-semibold text-emerald-700">
                Estado: {orden.estado}
              </p>
            </div>
          </div>

          {/* Datos Cliente y Vehículo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/70 text-xs">
            <div className="space-y-1">
              <p className="font-bold text-slate-700 uppercase flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-600" /> Cliente
              </p>
              <p className="text-slate-900 font-semibold text-sm">
                {orden.vehiculo?.cliente?.nombre || "Cliente General"}
              </p>
              <p className="text-slate-600">
                Doc: {orden.vehiculo?.cliente?.tipoDocumento}{" "}
                {orden.vehiculo?.cliente?.numeroDocumento}
              </p>
              <p className="text-slate-600">
                Tel: {orden.vehiculo?.cliente?.telefono || "N/A"}
              </p>
            </div>

            <div className="space-y-1">
              <p className="font-bold text-slate-700 uppercase flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-indigo-600" /> Vehículo
              </p>
              <p className="text-slate-900 font-semibold text-sm">
                Placa: {orden.vehiculo?.placa} — {orden.vehiculo?.marca}{" "}
                {orden.vehiculo?.modelo}
              </p>
              <p className="text-slate-600">
                Línea: {orden.vehiculo?.linea || "Estándar"} • Año:{" "}
                {orden.vehiculo?.anio}
              </p>
              <p className="text-slate-600">
                Técnico: {orden.mecanico?.nombre || "Sin asignar"}
              </p>
            </div>
          </div>

          {/* Diagnóstico / Trabajo Realizado */}
          <div>
            <p className="text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-indigo-600" /> Descripción del
              Servicio
            </p>
            <p className="text-sm text-slate-700 bg-slate-50/60 p-3 rounded-xl border border-slate-200/60">
              {orden.descripcionFalla}
            </p>
          </div>

          {/* Tabla de Repuestos Consumidos */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase mb-2">
              Detalle de Repuestos Utilizados
            </h4>
            {cargando ? (
              <p className="text-xs text-slate-400 py-4">
                Cargando repuestos...
              </p>
            ) : detalles.length === 0 ? (
              <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                No se cargaron repuestos de bodega a esta orden.
              </p>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase">
                    <th className="py-2">Código</th>
                    <th className="py-2">Descripción</th>
                    <th className="py-2 text-center">Cant.</th>
                    <th className="py-2 text-right">V. Unitario</th>
                    <th className="py-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {detalles.map((d) => (
                    <tr key={d.idDetalle}>
                      <td className="py-2.5 font-mono font-semibold text-slate-700">
                        {d.repuesto?.codigo}
                      </td>
                      <td className="py-2.5 text-slate-800">
                        {d.repuesto?.nombre}
                      </td>
                      <td className="py-2.5 text-center font-semibold">
                        {d.cantidad}
                      </td>
                      <td className="py-2.5 text-right text-slate-600">
                        {formatearMoneda(d.precioUnitario)}
                      </td>
                      <td className="py-2.5 text-right font-semibold text-slate-900">
                        {formatearMoneda(
                          Number(d.precioUnitario) * Number(d.cantidad),
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Mano de Obra y Totales */}
          <div className="border-t border-slate-200 pt-4 flex flex-col items-end space-y-2 text-sm">
            <div className="flex items-center justify-between w-full sm:w-72 text-slate-600">
              <span>Subtotal Repuestos:</span>
              <span className="font-semibold">
                {formatearMoneda(subtotalRepuestos)}
              </span>
            </div>

            <div className="flex items-center justify-between w-full sm:w-72 text-slate-600">
              <span>Mano de Obra (COP):</span>
              <input
                type="number"
                min={0}
                step="5000"
                value={manoObra}
                onChange={(e) => setManoObra(e.target.value)}
                className="w-28 px-2 py-1 text-right bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold print:border-none print:bg-transparent"
              />
            </div>

            <div className="flex items-center justify-between w-full sm:w-72 pt-2 border-t border-slate-200 text-base font-extrabold text-slate-900">
              <span>TOTAL A PAGAR:</span>
              <span className="text-indigo-600">
                {formatearMoneda(totalGeneral)}
              </span>
            </div>
          </div>

          {/* Pie de Firma */}
          <div className="pt-6 border-t border-slate-100 text-center text-[11px] text-slate-400">
            Documento generado por MecaCloud SaaS • Sistema desarrollado por
            Gabriel Humberto Rojas Hernández
          </div>
        </div>
      </div>
    </div>
  );
}
