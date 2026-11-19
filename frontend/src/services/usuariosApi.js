import { obtenerToken } from "./authService";

const API_URL = (
    import.meta.env.VITE_API_URL || "http://localhost:8080"
).replace(/\/+$/, "");

async function solicitar(ruta, opciones = {}) {
    const token = obtenerToken();

    if (!token) {
        throw new Error(
            "Debes iniciar sesión como administrador."
        );
    }

    let respuesta;

    try {
        respuesta = await fetch(
            `${API_URL}/api/admin/usuarios${ruta}`,
            {
                method: opciones.method || "GET",
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
            }
        );
    } catch {
        throw new Error(
            "No se pudo conectar con Spring Boot. Verifica que esté funcionando."
        );
    }

    const datos = await respuesta.json().catch(() => null);

    if (!respuesta.ok) {
        if (respuesta.status === 401) {
            throw new Error(
                "Tu sesión no es válida o ha expirado. Vuelve a iniciar sesión."
            );
        }

        if (respuesta.status === 403) {
            throw new Error(
                "No tienes permisos de administrador."
            );
        }

        if (respuesta.status === 404) {
            throw new Error(
                "El usuario solicitado no existe."
            );
        }

        if (respuesta.status === 409) {
            throw new Error(
                datos?.detail ||
                "No se pudo realizar la operación. Comprueba que el correo no esté duplicado y que permanezca un administrador activo."
            );
        }

        if (respuesta.status === 400) {
            throw new Error(
                "Revisa los datos del formulario."
            );
        }

        throw new Error(
            datos?.detail ||
            datos?.message ||
            `Error del servidor: HTTP ${respuesta.status}.`
        );
    }

    return datos;
}

async function listarUsuariosApi() {
    const usuarios = await solicitar("");

    if (!Array.isArray(usuarios)) {
        throw new Error(
            "El servidor no devolvió una lista válida de usuarios."
        );
    }

    return usuarios;
}

async function crearUsuarioApi(datos) {
    return solicitar("", {
        method: "POST",
        body: datos
    });
}

async function actualizarUsuarioApi(id, datos) {
    return solicitar(`/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: datos
    });
}

async function cambiarEstadoUsuarioApi(id, activo) {
    return solicitar(
        `/${encodeURIComponent(id)}/estado`,
        {
            method: "PUT",
            body: { activo }
        }
    );
}

export {
    listarUsuariosApi,
    crearUsuarioApi,
    actualizarUsuarioApi,
    cambiarEstadoUsuarioApi
};
