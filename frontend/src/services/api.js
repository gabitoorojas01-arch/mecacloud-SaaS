const API_URL = "http://localhost:8080/api";

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

  // Si el token expiró o es inválido, cerramos sesión automáticamente por seguridad
  if (respuesta.status === 401 || respuesta.status === 403) {
    localStorage.removeItem("mecacloud_token");
    localStorage.removeItem("mecacloud_usuario");
    window.location.reload();
    throw new Error("Sesión expirada. Por favor ingresa nuevamente.");
  }

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos.mensaje || "Error al procesar la solicitud");
  }

  return datos;
}
