
import { useEffect, useState } from "react";

import {
    listarPedidosApi,
    cambiarEstadoPedidoApi
} from "../services/pedidosApi";

const nombresEstados = {
    PENDIENTE: "Pendiente",
    EN_PREPARACION: "En preparación",
    LISTO_PARA_RETIRO: "Listo para retiro",
    ENVIADO: "Enviado",
    ENTREGADO: "Entregado"
};

function obtenerSiguientesEstados(pedido) {
    switch (pedido.estado) {
        case "PENDIENTE":
            return ["EN_PREPARACION"];

        case "EN_PREPARACION":
            return pedido.tipoEntrega === "RETIRO"
                ? ["LISTO_PARA_RETIRO"]
                : ["ENVIADO"];

        case "LISTO_PARA_RETIRO":
        case "ENVIADO":
            return ["ENTREGADO"];

        default:
            return [];
    }
}

function formatoFecha(valor) {
    const fecha = new Date(valor);

    return Number.isNaN(fecha.getTime())
        ? "Sin fecha"
        : fecha.toLocaleString("es-CL");
}

function GestionPedidos() {
    const [pedidos, setPedidos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [guardandoId, setGuardandoId] = useState(null);
    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [intento, setIntento] = useState(0);

    useEffect(() => {
        const controlador = new AbortController();

        async function cargarPedidos() {
            setCargando(true);
            setError("");

            try {
                const datos = await listarPedidosApi({
                    signal: controlador.signal
                });

                if (!controlador.signal.aborted) {
                    setPedidos(datos);
                }
            } catch (excepcion) {
                if (!controlador.signal.aborted) {
                    setError(excepcion.message);
                }
            } finally {
                if (!controlador.signal.aborted) {
                    setCargando(false);
                }
            }
        }

        cargarPedidos();

        return () => controlador.abort();
    }, [intento]);

    async function cambiarEstado(pedido, nuevoEstado) {
        if (nuevoEstado === pedido.estado) {
            return;
        }

        setError("");
        setMensaje("");
        setGuardandoId(pedido.id);

        try {
            const actualizado = await cambiarEstadoPedidoApi(
                pedido.id,
                nuevoEstado
            );

            setPedidos((actuales) =>
                actuales.map((item) =>
                    item.id === actualizado.id
                        ? actualizado
                        : item
                )
            );

            setMensaje(
                `Pedido #${pedido.id} actualizado a ${nombresEstados[actualizado.estado]}.`
            );
        } catch (excepcion) {
            setError(excepcion.message);
        } finally {
            setGuardandoId(null);
        }
    }

    return (
        <section className="container py-5">
            <h2 className="fw-bold">
                Gestión de pedidos
            </h2>

            <p className="text-secondary">
                Consulta los pedidos de MariaDB y actualiza
                su estado según el proceso de entrega.
            </p>

            {mensaje && (
                <div
                    className="alert alert-success"
                    role="status"
                >
                    {mensaje}
                </div>
            )}

            {error && (
                <div
                    className="alert alert-danger"
                    role="alert"
                >
                    {error}
                </div>
            )}

            <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="h5 mb-0">
                    Pedidos registrados ({pedidos.length})
                </h3>

                <button
                    type="button"
                    className="btn btn-outline-dark btn-sm"
                    disabled={cargando || guardandoId !== null}
                    onClick={() => {
                        setMensaje("");
                        setIntento((actual) => actual + 1);
                    }}
                >
                    Actualizar lista
                </button>
            </div>

            {cargando ? (
                <div
                    className="alert alert-info"
                    role="status"
                >
                    Cargando pedidos desde MariaDB...
                </div>
            ) : pedidos.length === 0 && !error ? (
                <div className="alert alert-secondary">
                    No existen pedidos registrados.
                </div>
            ) : pedidos.length > 0 ? (
                <div className="table-responsive mt-4">
                    <table className="table table-striped align-middle tabla-pedidos">
                        <thead>
                            <tr>
                                <th>Pedido</th>
                                <th>Cliente</th>
                                <th>Fecha</th>
                                <th>Entrega</th>
                                <th>Productos</th>
                                <th>Total</th>
                                <th>Estado</th>
                            </tr>
                        </thead>

                        <tbody>
                            {pedidos.map((pedido) => {
                                const siguientes = obtenerSiguientesEstados(
                                    pedido
                                );

                                return (
                                    <tr key={pedido.id}>
                                        <td>#{pedido.id}</td>

                                        <td>
                                            <strong>{pedido.cliente}</strong>
                                            <div className="small text-secondary">
                                                {pedido.correo}
                                            </div>
                                        </td>

                                        <td>
                                            {formatoFecha(pedido.fechaISO)}
                                        </td>

                                        <td>
                                            <strong>
                                                {pedido.tipoEntrega === "RETIRO"
                                                    ? "Retiro en tienda"
                                                    : "Despacho"}
                                            </strong>

                                            <div className="small text-secondary">
                                                {pedido.direccion}
                                            </div>
                                        </td>

                                        <td>
                                            {pedido.productos.map((producto) => (
                                                <div
                                                    key={producto.codigo}
                                                    className="small mb-1"
                                                >
                                                    {producto.nombre}
                                                    {" x "}
                                                    {producto.cantidad}
                                                </div>
                                            ))}
                                        </td>

                                        <td className="fw-bold">
                                            $
                                            {Number(pedido.total).toLocaleString("es-CL")}
                                        </td>

                                        <td>
                                            <select
                                                className="form-select"
                                                aria-label={`Estado del pedido ${pedido.id}`}
                                                value={pedido.estado}
                                                disabled={
                                                    guardandoId !== null ||
                                                    siguientes.length === 0
                                                }
                                                onChange={(evento) =>
                                                    cambiarEstado(
                                                        pedido,
                                                        evento.target.value
                                                    )
                                                }
                                            >
                                                <option value={pedido.estado}>
                                                    {nombresEstados[pedido.estado] ||
                                                        pedido.estado}
                                                </option>

                                                {siguientes.map((estado) => (
                                                    <option
                                                        key={estado}
                                                        value={estado}
                                                    >
                                                        {nombresEstados[estado]}
                                                    </option>
                                                ))}
                                            </select>

                                            {siguientes.length === 0 && (
                                                <small className="text-success">
                                                    Proceso finalizado
                                                </small>
                                            )}

                                            {guardandoId === pedido.id && (
                                                <small className="text-secondary">
                                                    Guardando...
                                                </small>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : null}
        </section>
    );
}

export default GestionPedidos;
