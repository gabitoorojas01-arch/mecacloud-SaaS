import { useState, useEffect } from "react";
import { fetchConToken } from "../services/api";
import ModalNuevoUsuario from "../components/ModalNuevoUsuario";
import { Users, ShieldCheck, Wrench, Plus, Search, Mail } from "lucide-react";

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState("TODOS");
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [mensajeOk, setMensajeOk] = useState("");

  const cargarUsuarios = async () => {
    try {
      setCargando(true);
      const data = await fetchConToken("/usuarios");
      setUsuarios(Array.isArray(data) ? data : []);
    } catch {
      setUsuarios([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const obtenerBadgeRol = (rol) => {
    if (rol === "ADMIN")
      return "bg-indigo-50 text-indigo-700 border-indigo-200";
    if (rol === "MECANICO")
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    return "bg-amber-50 text-amber-700 border-amber-200";
  };

  const totalAdmins = usuarios.filter((u) => u.rol === "ADMIN").length;
  const totalMecanicos = usuarios.filter((u) => u.rol === "MECANICO").length;

  const usuariosFiltrados = usuarios.filter((u) => {
    const coincideTexto =
      u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.correo.toLowerCase().includes(busqueda.toLowerCase());
    const coincideRol = filtroRol === "TODOS" ? true : u.rol === filtroRol;
    return coincideTexto && coincideRol;
  });
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Equipo y Control de Roles
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Administración de accesos, mecánicos y credenciales encriptadas con
            BCrypt
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalAbierto(true)}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Nuevo Empleado
        </button>
      </div>

      {mensajeOk && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm font-medium">
          {mensajeOk}
        </div>
      )}

      {/* Tarjetas Resumen de Personal */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase">
              Total Personal
            </p>
            <p className="text-2xl font-bold text-slate-900">
              {usuarios.length}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase">
              Administradores
            </p>
            <p className="text-2xl font-bold text-slate-900">{totalAdmins}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase">
              Mecánicos Activos
            </p>
            <p className="text-2xl font-bold text-slate-900">
              {totalMecanicos}
            </p>
          </div>
        </div>
      </div>

      {/* Buscador y Filtro por Rol */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre o correo..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
          />
        </div>

        <select
          value={filtroRol}
          onChange={(e) => setFiltroRol(e.target.value)}
          className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700"
        >
          <option value="TODOS">Todos los roles</option>
          <option value="ADMIN">Administradores</option>
          <option value="MECANICO">Mecánicos</option>
          <option value="RECEPCION">Recepción</option>
        </select>
      </div>

      {/* Tabla de Usuarios */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {cargando ? (
          <p className="text-sm text-slate-400 text-center py-10">
            Cargando personal...
          </p>
        ) : usuariosFiltrados.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-10">
            No se encontraron usuarios.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                  <th className="py-3.5 px-5">ID</th>
                  <th className="py-3.5 px-5">Empleado</th>
                  <th className="py-3.5 px-5">Correo de Acceso</th>
                  <th className="py-3.5 px-5 text-center">Rol Asignado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {usuariosFiltrados.map((u) => (
                  <tr key={u.idUsuario} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-5 font-mono text-xs text-slate-500">
                      #{u.idUsuario}
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-slate-900">
                      {u.nombre}
                    </td>
                    <td className="py-3.5 px-5 text-slate-600">
                      <span className="inline-flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {u.correo}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${obtenerBadgeRol(u.rol)}`}
                      >
                        {u.rol}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalAbierto && (
        <ModalNuevoUsuario
          onCerrar={() => setModalAbierto(false)}
          onGuardado={async () => {
            setModalAbierto(false);
            setMensajeOk(
              "Empleado registrado y contraseña encriptada correctamente.",
            );
            setTimeout(() => setMensajeOk(""), 3500);
            await cargarUsuarios();
          }}
        />
      )}
    </div>
  );
}
