
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

    if (sesion?.id != null) {
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
        if (
            !item?.codigo ||
            !Number.isSafeInteger(item.cantidad) ||
            item.cantidad <= 0
        ) {
            continue;
        }

        const existente = carritoUsuario.find(
            (actual) => actual.codigo === item.codigo
        );

        if (existente) {
            existente.cantidad += item.cantidad;
        } else {
            carritoUsuario.push({ ...item });
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
        sesion.id != null &&
        localStorage.getItem(CLAVE_CARRITO)
    ) {
        migrarCarritoInvitado(sesion.id);
    }

    return leerCarrito(obtenerClaveActual());
}

function guardarCarrito(carrito) {
    const clave = obtenerClaveActual();

    if (carrito.length === 0) {
        localStorage.removeItem(clave);
        return;
    }

    localStorage.setItem(
        clave,
        JSON.stringify(carrito)
    );
}

function agregarAlCarrito(producto) {
    if (
        !producto?.codigo ||
        !Number.isSafeInteger(Number(producto.stock)) ||
        Number(producto.stock) < 0
    ) {
        throw new Error(
            "El producto no tiene información de stock válida."
        );
    }

    const carrito = obtenerCarrito();

    const existente = carrito.find(
        (item) => item.codigo === producto.codigo
    );

    const cantidadActual = existente?.cantidad || 0;

    if (cantidadActual >= producto.stock) {
        throw new Error(
            "No hay suficiente stock disponible."
        );
    }

    const carritoActualizado = existente
        ? carrito.map((item) =>
            item.codigo === producto.codigo
                ? {
                    ...producto,
                    cantidad: item.cantidad + 1
                }
                : item
        )
        : [
            ...carrito,
            {
                ...producto,
                cantidad: 1
            }
        ];

    guardarCarrito(carritoActualizado);

    return carritoActualizado;
}

function eliminarDelCarrito(codigo) {
    const nuevoCarrito = obtenerCarrito().filter(
        (item) => item.codigo !== codigo
    );

    guardarCarrito(nuevoCarrito);

    return nuevoCarrito;
}

function vaciarCarrito() {
    localStorage.removeItem(obtenerClaveActual());
}

function sincronizarCarritoConProductos(productosActuales) {
    if (!Array.isArray(productosActuales)) {
        throw new Error(
            "No se pudo verificar el catálogo de productos."
        );
    }

    const carritoOriginal = obtenerCarrito();

    const productosPorCodigo = new Map(
        productosActuales.map((producto) => [
            producto.codigo,
            producto
        ])
    );

    const carritoActualizado = [];
    const advertencias = [];
    let puedeContinuar = true;

    for (const item of carritoOriginal) {
        const producto = productosPorCodigo.get(item?.codigo);

        if (!producto) {
            advertencias.push(
                `El producto ${item?.codigo || "desconocido"} ya no está disponible y se retiró del carrito.`
            );
            continue;
        }

        if (
            !Number.isSafeInteger(item.cantidad) ||
            item.cantidad <= 0
        ) {
            advertencias.push(
                `Se retiró ${producto.nombre} porque su cantidad no era válida.`
            );
            continue;
        }

        if (Number(item.precio) !== Number(producto.precio)) {
            advertencias.push(
                `El precio de ${producto.nombre} cambió. Se actualizó al precio vigente.`
            );
        }

        if (item.cantidad > producto.stock) {
            puedeContinuar = false;

            advertencias.push(
                `Stock insuficiente para ${producto.nombre}. Solicitadas: ${item.cantidad}. Disponibles: ${producto.stock}.`
            );
        }

        carritoActualizado.push({
            ...producto,
            cantidad: item.cantidad
        });
    }

    guardarCarrito(carritoActualizado);

    return {
        carrito: carritoActualizado,
        advertencias,
        puedeContinuar
    };
}

export {
    obtenerCarrito,
    guardarCarrito,
    agregarAlCarrito,
    eliminarDelCarrito,
    vaciarCarrito,
    migrarCarritoInvitado,
    sincronizarCarritoConProductos
};
