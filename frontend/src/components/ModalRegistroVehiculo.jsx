import { useState } from "react";
import { fetchConToken } from "../services/api";
import { X } from "lucide-react";

export default function ModalRegistroVehiculo({
  placaInicial = "",
  onCerrar,
  onRegistroExitoso,
}) {
  const [guardando, setGuardando] = useState(false);
  const [errorModal, setErrorModal] = useState("");
  const [clienteExistente, setClienteExistente] = useState(null);
  const [buscandoCliente, setBuscandoCliente] = useState(false);

  const [formCliente, setFormCliente] = useState({
    tipoDocumento: "CC",
    numeroDocumento: "",
    nombre: "",
    telefono: "",
    correo: "",
  });

  const [formVehiculo, setFormVehiculo] = useState({
    placa: placaInicial,
    marca: "",
    modelo: "",
    linea: "",
    anio: new Date().getFullYear(),
  });

  const handleBuscarClientePorDoc = async () => {
    const doc = formCliente.numeroDocumento.trim();
    if (!doc) return;
    setBuscandoCliente(true);
    setErrorModal("");
    try {
      const data = await fetchConToken(`/clientes/documento/${doc}`);
      setClienteExistente(data);
      setFormCliente({
        tipoDocumento: data.tipoDocumento,
        numeroDocumento: data.numeroDocumento,
        nombre: data.nombre,
        telefono: data.telefono || "",
        correo: data.correo || "",
      });
    } catch {
      setClienteExistente(null);
    } finally {
      setBuscandoCliente(false);
    }
  };

  const handleRegistrarTodo = async (e) => {
    e.preventDefault();
    setErrorModal("");
    setGuardando(true);
    try {
      let clienteFinal = clienteExistente;
      if (!clienteFinal) {
        clienteFinal = await fetchConToken("/clientes", {
          method: "POST",
          body: JSON.stringify({
            tipoDocumento: formCliente.tipoDocumento,
            numeroDocumento: formCliente.numeroDocumento.trim(),
            nombre: formCliente.nombre.trim(),
            telefono: formCliente.telefono.trim(),
            correo: formCliente.correo.trim(),
          }),
        });
      }

      const nuevoVehiculo = await fetchConToken("/vehiculos", {
        method: "POST",
        body: JSON.stringify({
          placa: formVehiculo.placa.trim().toUpperCase(),
          marca: formVehiculo.marca.trim(),
          modelo: formVehiculo.modelo.trim(),
          linea: formVehiculo.linea.trim(),
          anio: Number(formVehiculo.anio),
          cliente: { idCliente: clienteFinal.idCliente },
        }),
      });

      onRegistroExitoso(nuevoVehiculo);
    } catch (err) {
      setErrorModal(
        err.message ||
          "Error al guardar. Verifica que la placa o documento no existan.",
      );
    } finally {
      setGuardando(false);
    }
  };
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">
            Registrar Vehículo y Propietario
          </h3>
          <button
            type="button"
            onClick={onCerrar}
            className="p-1.5 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleRegistrarTodo} className="p-6 space-y-5">
          {errorModal && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 rounded-xl">
              {errorModal}
            </div>
          )}

          <div>
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-xs font-bold uppercase text-indigo-600">
                1. Datos del Propietario
              </h4>
              {clienteExistente && (
                <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full font-medium">
                  Cliente existente encontrado
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Tipo Doc.
                </label>
                <select
                  value={formCliente.tipoDocumento}
                  disabled={!!clienteExistente}
                  onChange={(e) =>
                    setFormCliente({
                      ...formCliente,
                      tipoDocumento: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                >
                  <option value="CC">CC</option>
                  <option value="NIT">NIT</option>
                  <option value="CE">CE</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Documento *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={formCliente.numeroDocumento}
                    onChange={(e) => {
                      setClienteExistente(null);
                      setFormCliente({
                        ...formCliente,
                        numeroDocumento: e.target.value,
                      });
                    }}
                    placeholder="Ej: 1020304050"
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleBuscarClientePorDoc}
                    disabled={buscandoCliente}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-xs font-semibold rounded-xl cursor-pointer"
                  >
                    {buscandoCliente ? "..." : "Verificar"}
                  </button>
                </div>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  disabled={!!clienteExistente}
                  value={formCliente.nombre}
                  onChange={(e) =>
                    setFormCliente({ ...formCliente, nombre: e.target.value })
                  }
                  placeholder="Ej: Carlos Andrés Gómez"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="text"
                  disabled={!!clienteExistente}
                  value={formCliente.telefono}
                  onChange={(e) =>
                    setFormCliente({ ...formCliente, telefono: e.target.value })
                  }
                  placeholder="300 123 4567"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Correo
                </label>
                <input
                  type="email"
                  disabled={!!clienteExistente}
                  value={formCliente.correo}
                  onChange={(e) =>
                    setFormCliente({ ...formCliente, correo: e.target.value })
                  }
                  placeholder="cliente@correo.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase text-indigo-600 mb-3">
              2. Datos del Vehículo
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Placa *
                </label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  value={formVehiculo.placa}
                  onChange={(e) =>
                    setFormVehiculo({
                      ...formVehiculo,
                      placa: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="XYZ789"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Marca *
                </label>
                <input
                  type="text"
                  required
                  value={formVehiculo.marca}
                  onChange={(e) =>
                    setFormVehiculo({ ...formVehiculo, marca: e.target.value })
                  }
                  placeholder="Mazda"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Modelo *
                </label>
                <input
                  type="text"
                  required
                  value={formVehiculo.modelo}
                  onChange={(e) =>
                    setFormVehiculo({ ...formVehiculo, modelo: e.target.value })
                  }
                  placeholder="CX-5"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Línea
                </label>
                <input
                  type="text"
                  value={formVehiculo.linea}
                  onChange={(e) =>
                    setFormVehiculo({ ...formVehiculo, linea: e.target.value })
                  }
                  placeholder="Grand Touring"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Año *
                </label>
                <input
                  type="number"
                  required
                  min={1950}
                  max={2030}
                  value={formVehiculo.anio}
                  onChange={(e) =>
                    setFormVehiculo({ ...formVehiculo, anio: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>
            </div>
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
              {guardando ? "Guardando..." : "Guardar Registro"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
