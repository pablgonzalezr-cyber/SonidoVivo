
import {
    obtenerProductoPorCodigo
} from "./productosService";

const CLAVE_CARRITO = "sonidoVivoCarrito";
const CLAVE_SESION = "sonidoVivoSesion";

function obtenerSesionLocal() {
    try {
        const datos = localStorage.getItem(CLAVE_SESION);
        return datos ? JSON.parse(datos) : null;
    } catch {
        return null;
    }
}

function claveCarritoUsuario(usuarioId) {
    return `${CLAVE_CARRITO}:usuario:${usuarioId}`;
}

function obtenerClaveActual() {
    const sesion = obtenerSesionLocal();

    if (sesion && sesion.id != null) {
        return claveCarritoUsuario(sesion.id);
    }

    return CLAVE_CARRITO;
}

function leerCarrito(clave) {
    try {
        const datos = localStorage.getItem(clave);
        const carrito = datos ? JSON.parse(datos) : [];

        return Array.isArray(carrito) ? carrito : [];
    } catch {
        return [];
    }
}

function migrarCarritoInvitado(usuarioId) {
    const invitados = leerCarrito(CLAVE_CARRITO);

    if (invitados.length === 0) {
        return;
    }

    const claveUsuario = claveCarritoUsuario(usuarioId);
    const carritoUsuario = leerCarrito(claveUsuario);

    for (const item of invitados) {
        const producto = obtenerProductoPorCodigo(item.codigo);

        if (
            !producto ||
            !Number.isSafeInteger(item.cantidad) ||
            item.cantidad <= 0
        ) {
            continue;
        }

        const existente = carritoUsuario.find(
            (actual) => actual.codigo === item.codigo
        );

        if (existente) {
            existente.cantidad = Math.min(
                producto.stock,
                existente.cantidad + item.cantidad
            );
        } else {
            const cantidad = Math.min(
                producto.stock,
                item.cantidad
            );

            if (cantidad > 0) {
                carritoUsuario.push({
                    ...producto,
                    cantidad
                });
            }
        }
    }

    localStorage.setItem(
        claveUsuario,
        JSON.stringify(carritoUsuario)
    );

    localStorage.removeItem(CLAVE_CARRITO);
}

function obtenerCarrito() {
    const sesion = obtenerSesionLocal();

    if (
        sesion?.rol === "CLIENTE" &&
        localStorage.getItem(CLAVE_CARRITO)
    ) {
        migrarCarritoInvitado(sesion.id);
    }

    const carrito = leerCarrito(obtenerClaveActual());

    return carrito.map((item) => {
        const producto = obtenerProductoPorCodigo(item.codigo);

        return producto
            ? { ...producto, cantidad: item.cantidad }
            : item;
    });
}

function guardarCarrito(carrito) {
    localStorage.setItem(
        obtenerClaveActual(),
        JSON.stringify(carrito)
    );
}

function agregarAlCarrito(producto) {
    const productoActual = obtenerProductoPorCodigo(
        producto.codigo
    );

    if (!productoActual) {
        throw new Error(
            "El producto ya no está disponible."
        );
    }

    const carrito = obtenerCarrito();

    const productoExistente = carrito.find(
        (item) => item.codigo === producto.codigo
    );

    const cantidadActual = productoExistente
        ? productoExistente.cantidad
        : 0;

    if (cantidadActual >= productoActual.stock) {
        throw new Error(
            "No hay suficiente stock disponible."
        );
    }

    if (productoExistente) {
        productoExistente.cantidad += 1;
    } else {
        carrito.push({
            ...productoActual,
            cantidad: 1
        });
    }

    guardarCarrito(carrito);
}

function eliminarDelCarrito(codigo) {
    const carrito = obtenerCarrito();

    const nuevoCarrito = carrito.filter(
        (item) => item.codigo !== codigo
    );

    guardarCarrito(nuevoCarrito);

    return nuevoCarrito;
}

function vaciarCarrito() {
    localStorage.removeItem(obtenerClaveActual());
}

export {
    obtenerCarrito,
    guardarCarrito,
    agregarAlCarrito,
    eliminarDelCarrito,
    vaciarCarrito,
    migrarCarritoInvitado
};
