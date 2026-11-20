
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { obtenerMisPedidosApi } from "../services/pedidosApi";

function formatearFecha(fechaISO) {
    if (!fechaISO) {
        return "Sin fecha";
    }

    const fecha = new Date(fechaISO);

    return Number.isNaN(fecha.getTime())
        ? "Sin fecha"
        : fecha.toLocaleString("es-CL");
}

function formatearEstado(estado) {
    return String(estado || "SIN_ESTADO")
        .replaceAll("_", " ");
}

function MisPedidos({ sesion }) {
    const [pedidos, setPedidos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [intento, setIntento] = useState(0);

    useEffect(() => {
        const controlador = new AbortController();

        async function cargarPedidos() {
            setCargando(true);
            setError("");

            try {
                const datos = await obtenerMisPedidosApi({
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
    }, [sesion?.id, intento]);

    return (
        <section className="container py-5">
            <h2 className="fw-bold">
                Mis pedidos
            </h2>

            <p className="text-secondary">
                Historial de compras registradas en Sonido Vivo.
            </p>

            {cargando && (
                <div className="alert alert-info" role="status">
                    Consultando pedidos en MariaDB...
                </div>
            )}

            {error && (
                <div className="alert alert-danger" role="alert">
                    <p>{error}</p>

                    <button
                        type="button"
                        className="btn btn-outline-danger"
                        onClick={() =>
                            setIntento((actual) => actual + 1)
                        }
                    >
                        Reintentar
                    </button>
                </div>
            )}

            {!cargando && !error && pedidos.length === 0 && (
                <div className="alert alert-secondary">
                    Todavía no tienes pedidos registrados.

                    <Link
                        to="/productos"
                        className="d-block mt-2"
                    >
                        Explorar productos
                    </Link>
                </div>
            )}

            {!cargando && !error && pedidos.length > 0 && (
                <div className="row g-4 mt-2">
                    {pedidos.map((pedido) => (
                        <div
                            className="col-12"
                            key={pedido.id}
                        >
                            <div className="card p-4">
                                <div className="d-flex justify-content-between flex-wrap gap-2">
                                    <div>
                                        <h3 className="h5">
                                            Pedido #{pedido.id}
                                        </h3>

                                        <p className="text-secondary mb-0">
                                            {formatearFecha(pedido.fechaISO)}
                                        </p>
                                    </div>

                                    <span className="badge bg-dark align-self-start">
                                        {formatearEstado(pedido.estado)}
                                    </span>
                                </div>

                                <hr />

                                <p>
                                    <strong>Entrega: </strong>
                                    {pedido.tipoEntrega === "RETIRO"
                                        ? "Retiro en tienda"
                                        : "Despacho a domicilio"}
                                </p>

                                <p>
                                    <strong>
                                        {pedido.tipoEntrega === "RETIRO"
                                            ? "Lugar: "
                                            : "Dirección: "}
                                    </strong>
                                    {pedido.direccion}
                                </p>

                                <h4 className="h6">
                                    Productos
                                </h4>

                                {pedido.productos.map((producto) => (
                                    <div
                                        className="d-flex justify-content-between gap-3 mb-2"
                                        key={producto.codigo}
                                    >
                                        <span>
                                            {producto.nombre} x{" "}
                                            {producto.cantidad}
                                        </span>

                                        <span>
                                            $
                                            {Number(producto.subtotal).toLocaleString("es-CL")}
                                        </span>
                                    </div>
                                ))}

                                <hr />

                                <p className="fw-bold mb-0">
                                    Total: $
                                    {Number(pedido.total).toLocaleString("es-CL")}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

export default MisPedidos;
