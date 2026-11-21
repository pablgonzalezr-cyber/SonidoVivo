import { obtenerToken } from "./authService";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:8080")
    .replace(/\/+$/, "");

async function solicitar(ruta, opciones = {}) {
    const token = obtenerToken();
    if (!token) {
        throw new Error("Debes iniciar sesión como administrador o vendedor.");
    }

    let respuesta;
    try {
        respuesta = await fetch(`${API_URL}/api/vendedor/inventario${ruta}`, {
            method: "GET",
            headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
            signal: opciones.signal
        });
    } catch (error) {
        if (error?.name === "AbortError") throw error;
        throw new Error("No se pudo conectar con Spring Boot.");
    }

    const datos = await respuesta.json().catch(() => null);
    if (!respuesta.ok) {
        if (respuesta.status === 401) throw new Error("La sesión expiró. Inicia sesión nuevamente.");
        if (respuesta.status === 403) throw new Error("No tienes permisos de inventario.");
        if (respuesta.status === 400) throw new Error(datos?.detail || "Filtro no válido.");
        throw new Error(datos?.detail || `Error HTTP ${respuesta.status}`);
    }
    return datos;
}

async function obtenerResumenInventarioApi(umbral = 5, opciones = {}) {
    return solicitar(`/resumen?umbral=${encodeURIComponent(umbral)}`, opciones);
}

async function listarMovimientosStockApi(codigo = "", opciones = {}) {
    const query = codigo.trim() ? `?codigo=${encodeURIComponent(codigo.trim())}` : "";
    const datos = await solicitar(`/movimientos${query}`, opciones);
    if (!Array.isArray(datos)) throw new Error("Historial de inventario inválido.");
    return datos;
}

export { obtenerResumenInventarioApi, listarMovimientosStockApi };
