function obtenerFechaPedido(pedido) {
    if (!pedido.fechaISO) {
        return null;
    }

    const fecha = new Date(pedido.fechaISO);

    return Number.isNaN(fecha.getTime())
        ? null
        : fecha;
}

function convertirFechaLocal(fecha) {
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");

    return `${anio}-${mes}-${dia}`;
}

function generarReporteVentas(
    pedidos = [],
    desde = "",
    hasta = ""
) {
    const pedidosFiltrados = pedidos.filter((pedido) => {
        if (!desde && !hasta) {
            return true;
        }

        const fecha = obtenerFechaPedido(pedido);

        if (!fecha) {
            return false;
        }

        const fechaPedido = convertirFechaLocal(fecha);

        return (
            (!desde || fechaPedido >= desde) &&
            (!hasta || fechaPedido <= hasta)
        );
    });

    const montoTotal = pedidosFiltrados.reduce(
        (total, pedido) =>
            total + (Number(pedido.total) || 0),
        0
    );

    const unidades = pedidosFiltrados.reduce(
        (total, pedido) =>
            total + (Array.isArray(pedido.productos)
                ? pedido.productos.reduce(
                    (subtotal, producto) =>
                        subtotal + (Number(producto.cantidad) || 0),
                    0
                )
                : 0),
        0
    );

    const porEstado = {};

    for (const pedido of pedidosFiltrados) {
        const estado = pedido.estado || "SIN_ESTADO";

        porEstado[estado] =
            (porEstado[estado] || 0) + 1;
    }

    const porEntrega = {
        DESPACHO: pedidosFiltrados.filter(
            (pedido) => pedido.tipoEntrega === "DESPACHO"
        ).length,

        RETIRO: pedidosFiltrados.filter(
            (pedido) => pedido.tipoEntrega === "RETIRO"
        ).length
    };

    const pedidosOrdenados = [...pedidosFiltrados].sort(
        (primero, segundo) =>
            (obtenerFechaPedido(segundo)?.getTime() || 0) -
            (obtenerFechaPedido(primero)?.getTime() || 0)
    );

    return {
        cantidadPedidos: pedidosFiltrados.length,
        montoTotal,
        unidades,
        ticketPromedio: pedidosFiltrados.length > 0
            ? Math.round(
                montoTotal / pedidosFiltrados.length
            )
            : 0,
        porEstado,
        porEntrega,
        pedidos: pedidosOrdenados
    };
}

export {
    generarReporteVentas
};
