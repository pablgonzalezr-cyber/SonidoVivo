import {
    descontarStock,
    obtenerProductoPorCodigo
} from "./productosService";


const CLAVE_PEDIDOS = "sonidoVivoPedidos";


function obtenerPedidos() {

    const datos =
        localStorage.getItem(CLAVE_PEDIDOS);


    if (!datos) {

        return [];

    }


    return JSON.parse(datos);

}


function guardarPedidos(pedidos) {

    localStorage.setItem(
        CLAVE_PEDIDOS,
        JSON.stringify(pedidos)
    );

}



function crearPedido({
    usuario,
    productos,
    direccion = "",
    tipoEntrega = "DESPACHO"
}) {

    if (!usuario || usuario.rol !== "CLIENTE") {
        throw new Error(
            "Debes iniciar sesión como cliente para comprar."
        );
    }

    if (!["DESPACHO", "RETIRO"].includes(tipoEntrega)) {
        throw new Error(
            "Selecciona un tipo de entrega válido."
        );
    }

    if (!Array.isArray(productos) || productos.length === 0) {
        throw new Error(
            "No hay productos en el pedido."
        );
    }

    const direccionFinal = tipoEntrega === "RETIRO"
        ? "Retiro en tienda"
        : String(direccion).trim();

    if (
        tipoEntrega === "DESPACHO" &&
        direccionFinal.length < 5
    ) {
        throw new Error(
            "Ingresa una dirección válida."
        );
    }

    const productosActualizados = productos.map((item) => {

        if (
            !Number.isSafeInteger(item.cantidad) ||
            item.cantidad <= 0
        ) {
            throw new Error(
                "La cantidad solicitada no es válida."
            );
        }

        const productoActual = obtenerProductoPorCodigo(
            item.codigo
        );

        if (!productoActual) {
            throw new Error(
                "Uno de los productos ya no está disponible."
            );
        }

        if (
            Number(item.precio) !==
            Number(productoActual.precio)
        ) {
            throw new Error(
                `El precio de ${productoActual.nombre} cambió. Vuelve al carrito para revisar el nuevo valor.`
            );
        }

        return {
            ...productoActual,
            cantidad: item.cantidad
        };

    });

    const total = productosActualizados.reduce(
        (acumulador, producto) =>
            acumulador +
            producto.precio * producto.cantidad,
        0
    );

    const pedidos = obtenerPedidos();

    const nuevoPedido = {
        id: Date.now(),
        usuarioId: usuario.id,
        cliente: usuario.nombre,
        correo: usuario.correo,
        tipoEntrega,
        direccion: direccionFinal,
        fecha: new Date().toLocaleString("es-CL"),
        estado: "PENDIENTE",
        productos: productosActualizados,
        total
    };

    descontarStock(productosActualizados);

    pedidos.push(nuevoPedido);

    guardarPedidos(pedidos);

    return nuevoPedido;
}



function obtenerPedidosPorUsuario(
    usuarioId
) {

    const pedidos = obtenerPedidos();


    return pedidos.filter(
        (pedido) =>
            pedido.usuarioId === usuarioId
    );

}


function actualizarEstadoPedido(
    pedidoId,
    nuevoEstado
) {

    const pedidos = obtenerPedidos();


    const pedidosActualizados =
        pedidos.map(
            (pedido) => {

                if (
                    pedido.id === pedidoId
                ) {

                    return {
                        ...pedido,
                        estado: nuevoEstado
                    };

                }


                return pedido;

            }
        );


    guardarPedidos(
        pedidosActualizados
    );


    return pedidosActualizados;

}


export {
    obtenerPedidos,
    crearPedido,
    obtenerPedidosPorUsuario,
    actualizarEstadoPedido
};

