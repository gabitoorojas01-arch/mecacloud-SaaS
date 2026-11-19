import { Wrench, Kanban, Car, Package, LogOut } from "lucide-react";

export default function Sidebar({
  vistaActiva,
  setVistaActiva,
  usuario,
  onLogout,
}) {
  const menuItems = [
    { id: "kanban", label: "Tablero Kanban", icono: Kanban },
    { id: "vehiculos", label: "Hoja de Vida Vehicular", icono: Car },
    { id: "inventario", label: "Inventario Inteligente", icono: Package },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col min-h-screen shrink-0">
      {/* Logo de Marca */}
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-sm">
          <Wrench className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-white font-bold text-lg tracking-tight leading-none">
            MecaCloud
          </h1>
          <span className="text-xs text-indigo-400 font-medium">
            SaaS Automotriz
          </span>
        </div>
      </div>

      {/* Navegación Principal */}
      <nav className="flex-1 px-4 py-6 space-y-1.5">
        <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Operaciones
        </p>
        {menuItems.map((item) => {
          const Icono = item.icono;
          const activa = vistaActiva === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setVistaActiva(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
                activa
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:bg-slate-800/70 hover:text-white"
              }`}
            >
              <Icono className="w-5 h-5 shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Perfil de Usuario y Salida */}
      <div className="p-4 border-t border-slate-800">
        <div className="px-3 py-2.5 mb-2 rounded-xl bg-slate-800/50">
          <p className="text-sm font-medium text-white truncate">
            {usuario.nombre}
          </p>
          <p className="text-xs text-indigo-400 font-medium mt-0.5">
            {usuario.rol}
          </p>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
