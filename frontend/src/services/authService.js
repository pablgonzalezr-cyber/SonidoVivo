
import { migrarCarritoInvitado } from "./carritoService";

const API_URL = (
    import.meta.env.VITE_API_URL || "http://localhost:8080"
).replace(/\/+$/, "");

const CLAVE_TOKEN = "sonidoVivoJwt";
const CLAVE_SESION = "sonidoVivoSesion";

function obtenerToken() {
    return localStorage.getItem(CLAVE_TOKEN);
}

function guardarUsuarioLocal(usuario) {
    localStorage.setItem(
        CLAVE_SESION,
        JSON.stringify(usuario)
    );
}

function cerrarSesion() {
    localStorage.removeItem(CLAVE_TOKEN);
    localStorage.removeItem(CLAVE_SESION);
}

function obtenerSesion() {
    if (!obtenerToken()) {
        return null;
    }

    try {
        const datos = localStorage.getItem(CLAVE_SESION);
        return datos ? JSON.parse(datos) : null;
    } catch {
        return null;
    }
}

async function solicitar(ruta, opciones = {}) {
    let respuesta;

    try {
        respuesta = await fetch(`${API_URL}${ruta}`, {
            method: opciones.method || "GET",
            headers: {
                "Content-Type": "application/json",
                ...(opciones.token
                    ? { Authorization: `Bearer ${opciones.token}` }
                    : {})
            },
            body: opciones.body
                ? JSON.stringify(opciones.body)
                : undefined
        });
    } catch {
        throw new Error(
            "No se pudo conectar con el backend de Sonido Vivo."
        );
    }

    const datos = await respuesta.json().catch(() => null);

    if (!respuesta.ok) {
        if (respuesta.status === 401) {
            throw new Error(
                "Correo o contrasena incorrectos, o sesion vencida."
            );
        }

        if (respuesta.status === 409) {
            throw new Error(
                "El correo ya se encuentra registrado."
            );
        }

        if (respuesta.status === 403) {
            throw new Error("No tienes permisos para esta operacion.");
        }

        if (respuesta.status === 400) {
            throw new Error(
                "Los datos ingresados no cumplen las validaciones."
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

async function registrarCuenta(usuario) {
    return solicitar("/api/auth/registro", {
        method: "POST",
        body: usuario
    });
}

async function iniciarSesion(correo, contrasena) {
    const respuesta = await solicitar("/api/auth/login", {
        method: "POST",
        body: {
            correo: correo.trim().toLowerCase(),
            contrasena
        }
    });

    if (!respuesta?.token || !respuesta?.usuario) {
        throw new Error(
            "El servidor no devolvio una sesion valida."
        );
    }

    localStorage.setItem(CLAVE_TOKEN, respuesta.token);
    guardarUsuarioLocal(respuesta.usuario);

    if (respuesta.usuario.rol === "CLIENTE") {
        migrarCarritoInvitado(respuesta.usuario.id);
    }

    return respuesta.usuario;
}

async function recuperarSesion() {
    const token = obtenerToken();

    if (!token) {
        localStorage.removeItem(CLAVE_SESION);
        return null;
    }

    try {
        const usuario = await solicitar("/api/auth/me", {
            token
        });

        guardarUsuarioLocal(usuario);
        return usuario;
    } catch (error) {
        if (
            error.message.includes("sesion vencida") ||
            error.message.includes("No tienes permisos")
        ) {
            cerrarSesion();
            return null;
        }

        throw error;
    }
}

function obtenerExpiracionToken() {
    const token = obtenerToken();

    if (!token) {
        return null;
    }

    try {
        const contenido = JSON.parse(
            atob(token.split(".")[1])
        );

        return typeof contenido.exp === "number"
            ? contenido.exp * 1000
            : null;
    } catch {
        return null;
    }
}

export {
    iniciarSesion,
    registrarCuenta,
    recuperarSesion,
    obtenerSesion,
    obtenerToken,
    obtenerExpiracionToken,
    cerrarSesion
};
