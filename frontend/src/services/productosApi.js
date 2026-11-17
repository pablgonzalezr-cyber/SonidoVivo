const BASE_URL = (
    import.meta.env.VITE_API_URL || "http://localhost:8080"
).replace(/\/+$/, "");

async function obtenerJson(ruta, opciones = {}) {
    let respuesta;

    try {
        respuesta = await fetch(`${BASE_URL}${ruta}`, {
            method: "GET",
            signal: opciones.signal,
            headers: { Accept: "application/json" }
        });
    } catch (error) {
        if (error?.name === "AbortError") {
            throw error;
        }
        throw new Error("No se pudo conectar con el servidor de Sonido Vivo.");
    }

    if (respuesta.status === 404) {
        throw new Error("El producto solicitado no existe.");
    }

    if (!respuesta.ok) {
        throw new Error(`Error del servidor: HTTP ${respuesta.status}.`);
    }

    return respuesta.json();
}

async function listarProductosApi(opciones = {}) {
    const productos = await obtenerJson("/api/productos", opciones);

    if (!Array.isArray(productos)) {
        throw new Error("La API no devolvio una lista de productos.");
    }

    return productos;
}

async function obtenerProductoApi(codigo, opciones = {}) {
    return obtenerJson(
        `/api/productos/${encodeURIComponent(codigo)}`,
        opciones
    );
}

export { listarProductosApi, obtenerProductoApi };
