import {
    descontarStock
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

    if (!["DESPACHO", "RETIRO"].includes(tipoEntrega)) {
        throw new Error("Selecciona un tipo de entrega valido.");
    }

    if (!Array.isArray(productos) || productos.length === 0) {
        throw new Error("No hay productos en el pedido.");
    }

    const direccionFinal = tipoEntrega === "DESPACHO"
        ? String(direccion).trim()
        : "Retiro en tienda";

    if (tipoEntrega === "DESPACHO" && direccionFinal.length < 5) {
        throw new Error("Ingresa una direccion valida.");
    }

    const pedidos = obtenerPedidos();

    const total = productos.reduce(
        (acumulador, producto) =>
            acumulador + producto.precio * producto.cantidad,
        0
    );

    const nuevoPedido = {
        id: Date.now(),
        usuarioId: usuario.id,
        cliente: usuario.nombre,
        correo: usuario.correo,
        tipoEntrega: tipoEntrega,
        direccion: direccionFinal,
        fecha: new Date().toLocaleString("es-CL"),
        estado: "PENDIENTE",
        productos: productos,
        total: total
    };

    descontarStock(productos);

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

