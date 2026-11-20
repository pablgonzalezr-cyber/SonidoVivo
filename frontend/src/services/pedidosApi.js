
import { obtenerToken } from "./authService";

const API_URL = (
    import.meta.env.VITE_API_URL || "http://localhost:8080"
).replace(/\/+$/, "");

async function solicitar(ruta, opciones = {}) {
    const token = obtenerToken();

    if (!token) {
        throw new Error(
            "Debes iniciar sesión para consultar o realizar pedidos."
        );
    }

    let respuesta;

    try {
        respuesta = await fetch(`${API_URL}/api/pedidos${ruta}`, {
            method: opciones.method || "GET",
            signal: opciones.signal,
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
                ...(opciones.body !== undefined
                    ? { "Content-Type": "application/json" }
                    : {})
            },
            body: opciones.body !== undefined
                ? JSON.stringify(opciones.body)
                : undefined
        });
    } catch (error) {
        if (error?.name === "AbortError") {
            throw error;
        }

        throw new Error(
            "No se pudo conectar con Spring Boot. Verifica que el backend esté funcionando."
        );
    }

    const datos = respuesta.status === 204
        ? null
        : await respuesta.json().catch(() => null);

    if (!respuesta.ok) {
        const detalle = datos?.detail || datos?.message;

        if (respuesta.status === 400) {
            throw new Error(
                detalle || "Revisa los datos del pedido."
            );
        }

        if (respuesta.status === 401) {
            throw new Error(
                "Tu sesión no es válida o ha expirado. Vuelve a iniciar sesión."
            );
        }

        if (respuesta.status === 403) {
            throw new Error(
                "Tu cuenta no tiene permisos para realizar esta operación."
            );
        }

        if (respuesta.status === 404) {
            throw new Error(
                detalle || "El pedido o producto solicitado no existe."
            );
        }

        if (respuesta.status === 409) {
            throw new Error(
                detalle || "El precio o stock cambió. Revisa tu carrito."
            );
        }

        throw new Error(
            detalle || `Error del servidor: HTTP ${respuesta.status}.`
        );
    }

    return datos;
}

async function crearPedidoApi(datos) {
    return solicitar("", {
        method: "POST",
        body: datos
    });
}

async function obtenerMisPedidosApi(opciones = {}) {
    const pedidos = await solicitar("/mis", opciones);

    if (!Array.isArray(pedidos)) {
        throw new Error(
            "El servidor no devolvió un historial válido."
        );
    }

    return pedidos;
}

async function listarPedidosApi(opciones = {}) {
    const pedidos = await solicitar("", opciones);

    if (!Array.isArray(pedidos)) {
        throw new Error(
            "El servidor no devolvió una lista válida de pedidos."
        );
    }

    return pedidos;
}

async function cambiarEstadoPedidoApi(id, estado) {
    return solicitar(
        `/${encodeURIComponent(id)}/estado`,
        {
            method: "PUT",
            body: { estado }
        }
    );
}

export {
    crearPedidoApi,
    obtenerMisPedidosApi,
    listarPedidosApi,
    cambiarEstadoPedidoApi
};
