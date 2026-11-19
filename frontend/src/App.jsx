import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Sidebar from "./components/Sidebar";
import KanbanBoard from "./pages/KanbanBoard";

function App() {
  const [usuario, setUsuario] = useState(null);
  const [vistaActiva, setVistaActiva] = useState("kanban");

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem("mecacloud_usuario");
    const tokenGuardado = localStorage.getItem("mecacloud_token");
    if (usuarioGuardado && tokenGuardado) {
      setUsuario(JSON.parse(usuarioGuardado));
    }
  }, []);

  const cerrarSesion = () => {
    localStorage.removeItem("mecacloud_token");
    localStorage.removeItem("mecacloud_usuario");
    setUsuario(null);
  };

  if (!usuario) {
    return (
      <Login onLoginSuccess={(datosUsuario) => setUsuario(datosUsuario)} />
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar
        vistaActiva={vistaActiva}
        setVistaActiva={setVistaActiva}
        usuario={usuario}
        onLogout={cerrarSesion}
      />

      <main className="flex-1 overflow-y-auto">
        {vistaActiva === "kanban" && <KanbanBoard />}
        {vistaActiva === "vehiculos" && (
          <div className="p-8 text-slate-500 text-sm">
            Módulo de Hoja de Vida Vehicular (Próximo paso)
          </div>
        )}
        {vistaActiva === "inventario" && (
          <div className="p-8 text-slate-500 text-sm">
            Módulo de Inventario Inteligente (Próximo paso)
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
