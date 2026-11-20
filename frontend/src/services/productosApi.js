import { obtenerToken } from "./authService";

const BASE_URL = (
    import.meta.env.VITE_API_URL || "http://localhost:8080"
).replace(/\/+$/, "");

async function solicitarProducto(ruta, opciones = {}) {
    const metodo = opciones.method || "GET";

    const headers = {
        Accept: "application/json"
    };

    if (opciones.body !== undefined) {
        headers["Content-Type"] = "application/json";
    }

    if (opciones.protegido) {
        const token = obtenerToken();

        if (!token) {
            throw new Error(
                "Debes iniciar sesión para realizar esta operación."
            );
        }

        headers.Authorization = `Bearer ${token}`;
    }

    let respuesta;

    try {
        respuesta = await fetch(`${BASE_URL}${ruta}`, {
            method: metodo,
            headers,
            signal: opciones.signal,
            body: opciones.body !== undefined
                ? JSON.stringify(opciones.body)
                : undefined
        });
    } catch (error) {
        if (error?.name === "AbortError") {
            throw error;
        }

        throw new Error(
            "No se pudo conectar con el servidor de Sonido Vivo."
        );
    }

    if (respuesta.status === 204) {
        return null;
    }

    const datos = await respuesta.json().catch(() => null);

    if (!respuesta.ok) {
        if (respuesta.status === 400) {
            throw new Error(
                datos?.detail ||
                "Revisa los datos ingresados para el producto."
            );
        }

        if (respuesta.status === 401) {
            throw new Error(
                "Tu sesión expiró o no es válida. Vuelve a iniciar sesión."
            );
        }

        if (respuesta.status === 403) {
            throw new Error(
                "No tienes permisos para modificar productos."
            );
        }

        if (respuesta.status === 404) {
            throw new Error(
                "El producto solicitado no existe."
            );
        }

        if (respuesta.status === 409) {
            throw new Error(
                datos?.detail ||
                "Ya existe un producto con ese código."
            );
        }

        throw new Error(
            `Error del servidor: HTTP ${respuesta.status}.`
        );
    }

    return datos;
}

async function listarProductosApi(opciones = {}) {
    const productos = await solicitarProducto(
        "/api/productos",
        opciones
    );

    if (!Array.isArray(productos)) {
        throw new Error(
            "La API no devolvió una lista de productos."
        );
    }

    return productos;
}

async function obtenerProductoApi(codigo, opciones = {}) {
    return solicitarProducto(
        `/api/productos/${encodeURIComponent(codigo)}`,
        opciones
    );
}

async function crearProductoApi(datos) {
    return solicitarProducto("/api/productos", {
        method: "POST",
        protegido: true,
        body: datos
    });
}

async function actualizarProductoApi(codigo, datos) {
    return solicitarProducto(
        `/api/productos/${encodeURIComponent(codigo)}`,
        {
            method: "PUT",
            protegido: true,
            body: datos
        }
    );
}

async function eliminarProductoApi(codigo) {
    return solicitarProducto(
        `/api/productos/${encodeURIComponent(codigo)}`,
        {
            method: "DELETE",
            protegido: true
        }
    );
}

async function actualizarStockApi(codigo, stock) {
    return solicitarProducto(
        `/api/productos/${encodeURIComponent(codigo)}/stock`,
        {
            method: "PUT",
            protegido: true,
            body: { stock }
        }
    );
}

export {
    listarProductosApi,
    obtenerProductoApi,
    crearProductoApi,
    actualizarProductoApi,
    eliminarProductoApi,
    actualizarStockApi
};
