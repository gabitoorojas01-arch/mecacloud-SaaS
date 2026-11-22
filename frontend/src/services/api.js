const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

// Función profesional que envía el Token JWT automáticamente en cada petición
export async function fetchConToken(endpoint, opciones = {}) {
  const token = localStorage.getItem("mecacloud_token");

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...opciones.headers,
  };

  const respuesta = await fetch(`${API_URL}${endpoint}`, {
    ...opciones,
    headers,
  });

  // 401: Token expirado o inválido -> Cerramos sesión por seguridad
  if (respuesta.status === 401) {
    localStorage.removeItem("mecacloud_token");
    localStorage.removeItem("mecacloud_usuario");
    window.location.reload();
    throw new Error("Sesión expirada. Por favor ingresa nuevamente.");
  }

  // 403: Usuario autenticado pero sin permisos para esta acción
  if (respuesta.status === 403) {
    throw new Error(
      "Acceso denegado: no tienes permisos para realizar esta acción.",
    );
  }

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos.mensaje || "Error al procesar la solicitud");
  }

  return datos;
}
