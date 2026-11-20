
import { useEffect, useState } from "react";

import { listarPedidosApi } from "../services/pedidosApi";
import { generarReporteVentas } from "../services/reportesService";

function formatoPrecio(valor) {
    return `$${Number(valor).toLocaleString("es-CL")}`;
}

function formatoFecha(valor) {
    const fecha = new Date(valor);

    return Number.isNaN(fecha.getTime())
        ? "Sin fecha"
        : fecha.toLocaleString("es-CL");
}

function formatoEstado(estado) {
    return String(estado || "SIN_ESTADO")
        .replaceAll("_", " ");
}

function ReportesVentas() {
    const [pedidos, setPedidos] = useState([]);
    const [desde, setDesde] = useState("");
    const [hasta, setHasta] = useState("");
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [intento, setIntento] = useState(0);

    useEffect(() => {
        const controlador = new AbortController();

        async function cargarDatos() {
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

        cargarDatos();

        return () => controlador.abort();
    }, [intento]);

    const fechasInvalidas = Boolean(
        desde && hasta && desde > hasta
    );

    const reporte = generarReporteVentas(
        pedidos,
        desde,
        hasta
    );

    function limpiarFiltros() {
        setDesde("");
        setHasta("");
    }

    return (
        <section className="container py-5">
            <h2 className="fw-bold">
                Reportes de ventas
            </h2>

            <p className="text-secondary">
                Estadísticas de pedidos registrados en MariaDB.
            </p>

            <div className="d-flex justify-content-end mb-3">
                <button
                    type="button"
                    className="btn btn-outline-dark btn-sm"
                    disabled={cargando}
                    onClick={() =>
                        setIntento((actual) => actual + 1)
                    }
                >
                    Actualizar datos
                </button>
            </div>

            {cargando && (
                <div
                    className="alert alert-info"
                    role="status"
                >
                    Cargando reportes desde Spring Boot...
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

            {!cargando && !error && (
                <>
                    <div className="card p-4 mb-4">
                        <h3 className="h5 mb-3">
                            Filtrar por fechas
                        </h3>

                        <div className="row g-3 align-items-end">
                            <div className="col-12 col-md-4">
                                <label
                                    htmlFor="fechaDesde"
                                    className="form-label"
                                >
                                    Desde
                                </label>

                                <input
                                    id="fechaDesde"
                                    type="date"
                                    className="form-control"
                                    value={desde}
                                    onChange={(evento) =>
                                        setDesde(evento.target.value)
                                    }
                                />
                            </div>

                            <div className="col-12 col-md-4">
                                <label
                                    htmlFor="fechaHasta"
                                    className="form-label"
                                >
                                    Hasta
                                </label>

                                <input
                                    id="fechaHasta"
                                    type="date"
                                    className="form-control"
                                    value={hasta}
                                    onChange={(evento) =>
                                        setHasta(evento.target.value)
                                    }
                                />
                            </div>

                            <div className="col-12 col-md-4">
                                <button
                                    type="button"
                                    className="btn btn-outline-dark w-100"
                                    onClick={limpiarFiltros}
                                >
                                    Limpiar filtros
                                </button>
                            </div>
                        </div>
                    </div>

                    {fechasInvalidas ? (
                        <div className="alert alert-danger" role="alert">
                            La fecha inicial no puede ser posterior
                            a la fecha final.
                        </div>
                    ) : (
                        <>
                            <div className="row g-3 mb-4">
                                <div className="col-12 col-sm-6 col-xl-3">
                                    <div className="card p-4 h-100">
                                        <h3 className="h6 text-secondary">
                                            Pedidos registrados
                                        </h3>

                                        <p className="display-6 fw-bold mb-0">
                                            {reporte.cantidadPedidos}
                                        </p>
                                    </div>
                                </div>

                                <div className="col-12 col-sm-6 col-xl-3">
                                    <div className="card p-4 h-100">
                                        <h3 className="h6 text-secondary">
                                            Monto total registrado
                                        </h3>

                                        <p className="h3 fw-bold mb-0">
                                            {formatoPrecio(reporte.montoTotal)}
                                        </p>
                                    </div>
                                </div>

                                <div className="col-12 col-sm-6 col-xl-3">
                                    <div className="card p-4 h-100">
                                        <h3 className="h6 text-secondary">
                                            Unidades compradas
                                        </h3>

                                        <p className="display-6 fw-bold mb-0">
                                            {reporte.unidades}
                                        </p>
                                    </div>
                                </div>

                                <div className="col-12 col-sm-6 col-xl-3">
                                    <div className="card p-4 h-100">
                                        <h3 className="h6 text-secondary">
                                            Ticket promedio
                                        </h3>

                                        <p className="h3 fw-bold mb-0">
                                            {formatoPrecio(reporte.ticketPromedio)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="row g-4 mb-4">
                                <div className="col-12 col-lg-6">
                                    <div className="card p-4 h-100">
                                        <h3 className="h5">
                                            Pedidos por estado
                                        </h3>

                                        {Object.keys(reporte.porEstado).length === 0 ? (
                                            <p className="text-secondary">
                                                No hay pedidos en este período.
                                            </p>
                                        ) : (
                                            <ul className="list-group list-group-flush">
                                                {Object.entries(reporte.porEstado).map(
                                                    ([estado, cantidad]) => (
                                                        <li
                                                            key={estado}
                                                            className="list-group-item d-flex justify-content-between"
                                                        >
                                                            <span>
                                                                {formatoEstado(estado)}
                                                            </span>

                                                            <strong>
                                                                {cantidad}
                                                            </strong>
                                                        </li>
                                                    )
                                                )}
                                            </ul>
                                        )}
                                    </div>
                                </div>

                                <div className="col-12 col-lg-6">
                                    <div className="card p-4 h-100">
                                        <h3 className="h5">
                                            Tipos de entrega
                                        </h3>

                                        <ul className="list-group list-group-flush">
                                            <li className="list-group-item d-flex justify-content-between">
                                                <span>
                                                    Despacho a domicilio
                                                </span>

                                                <strong>
                                                    {reporte.porEntrega.DESPACHO}
                                                </strong>
                                            </li>

                                            <li className="list-group-item d-flex justify-content-between">
                                                <span>
                                                    Retiro en tienda
                                                </span>

                                                <strong>
                                                    {reporte.porEntrega.RETIRO}
                                                </strong>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="card p-4">
                                <h3 className="h5 mb-3">
                                    Detalle de pedidos
                                </h3>

                                {reporte.pedidos.length === 0 ? (
                                    <div className="alert alert-secondary mb-0">
                                        No hay pedidos para las fechas seleccionadas.
                                    </div>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table table-striped align-middle">
                                            <thead>
                                                <tr>
                                                    <th>Pedido</th>
                                                    <th>Fecha</th>
                                                    <th>Cliente</th>
                                                    <th>Entrega</th>
                                                    <th>Estado</th>
                                                    <th>Total</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {reporte.pedidos.map((pedido) => (
                                                    <tr key={pedido.id}>
                                                        <td>#{pedido.id}</td>

                                                        <td>
                                                            {formatoFecha(pedido.fechaISO)}
                                                        </td>

                                                        <td>{pedido.cliente}</td>

                                                        <td>
                                                            {pedido.tipoEntrega === "RETIRO"
                                                                ? "Retiro"
                                                                : "Despacho"}
                                                        </td>

                                                        <td>
                                                            {formatoEstado(pedido.estado)}
                                                        </td>

                                                        <td className="fw-bold">
                                                            {formatoPrecio(pedido.total)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </>
            )}

            <p className="text-secondary small mt-3">
                Los datos provienen de pedidos registrados
                mediante Spring Boot y MariaDB. Los montos
                no representan pagos verificados.
            </p>
        </section>
    );
}

export default ReportesVentas;
