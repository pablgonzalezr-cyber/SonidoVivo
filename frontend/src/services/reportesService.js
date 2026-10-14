
import { obtenerPedidos } from "./pedidosService";

function obtenerFechaPedido(pedido) {

    if (pedido.fechaISO) {

        const fecha = new Date(pedido.fechaISO);

        if (!Number.isNaN(fecha.getTime())) {
            return fecha;
        }

    }

    if (typeof pedido.fecha === "string") {

        const partes = pedido.fecha.match(
            /^\s*(\d{1,2})[/-](\d{1,2})[/-](\d{4})/
        );

        if (partes) {

            const dia = Number(partes[1]);
            const mes = Number(partes[2]);
            const anio = Number(partes[3]);

            const fecha = new Date(anio, mes - 1, dia);

            if (
                fecha.getFullYear() === anio &&
                fecha.getMonth() === mes - 1 &&
                fecha.getDate() === dia
            ) {
                return fecha;
            }

        }

    }

    const identificador = Number(pedido.id);

    if (
        Number.isFinite(identificador) &&
        identificador > 946684800000
    ) {

        const fecha = new Date(identificador);

        if (!Number.isNaN(fecha.getTime())) {
            return fecha;
        }

    }

    return null;
}

function convertirFecha(fecha) {

    const anio = fecha.getFullYear();

    const mes = String(
        fecha.getMonth() + 1
    ).padStart(2, "0");

    const dia = String(
        fecha.getDate()
    ).padStart(2, "0");

    return `${anio}-${mes}-${dia}`;
}

function generarReporteVentas(desde = "", hasta = "") {

    const pedidos = obtenerPedidos();

    const pedidosFiltrados = pedidos.filter((pedido) => {

        if (!desde && !hasta) {
            return true;
        }

        const fecha = obtenerFechaPedido(pedido);

        if (!fecha) {
            return false;
        }

        const fechaPedido = convertirFecha(fecha);

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
        (total, pedido) => {

            if (!Array.isArray(pedido.productos)) {
                return total;
            }

            const cantidad = pedido.productos.reduce(
                (subtotal, producto) =>
                    subtotal + (Number(producto.cantidad) || 0),
                0
            );

            return total + cantidad;

        },
        0
    );

    const porEstado = {};

    for (const pedido of pedidosFiltrados) {

        const estado = pedido.estado || "SIN ESTADO";

        porEstado[estado] =
            (porEstado[estado] || 0) + 1;

    }

    const porEntrega = {
        DESPACHO: pedidosFiltrados.filter(
            (pedido) => pedido.tipoEntrega !== "RETIRO"
        ).length,

        RETIRO: pedidosFiltrados.filter(
            (pedido) => pedido.tipoEntrega === "RETIRO"
        ).length
    };

    const pedidosOrdenados = [...pedidosFiltrados].sort(
        (primero, segundo) => {

            const fechaA = obtenerFechaPedido(primero);
            const fechaB = obtenerFechaPedido(segundo);

            return (
                (fechaB?.getTime() || 0) -
                (fechaA?.getTime() || 0)
            );

        }
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
