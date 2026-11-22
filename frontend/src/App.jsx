import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Sidebar from "./components/Sidebar";
import KanbanBoard from "./pages/KanbanBoard";
import VehiculosPage from "./pages/VehiculosPage";
import InventarioPage from "./pages/InventarioPage";
import UsuariosPage from "./pages/UsuariosPage";
import DashboardPage from "./pages/DashboardPage";

function App() {
  const [usuario, setUsuario] = useState(null);
  const [vistaActiva, setVistaActiva] = useState("kanban");

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem("mecacloud_usuario");
    const tokenGuardado = localStorage.getItem("mecacloud_token");
    if (usuarioGuardado && tokenGuardado) {
      const datos = JSON.parse(usuarioGuardado);
      setUsuario(datos);
      if (datos.rol === "ADMIN") setVistaActiva("dashboard");
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
        {vistaActiva === "vehiculos" && <VehiculosPage />}
        {vistaActiva === "inventario" && <InventarioPage />}
        {vistaActiva === "usuarios" && <UsuariosPage />}
        {vistaActiva === "dashboard" && (
          <DashboardPage setVistaActiva={setVistaActiva} />
        )}
      </main>
    </div>
  );
}

export default App;
