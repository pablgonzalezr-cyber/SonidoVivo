
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { listarProductosApi } from "../services/productosApi";
import { crearPedidoApi } from "../services/pedidosApi";

import {
    obtenerCarrito,
    vaciarCarrito,
    sincronizarCarritoConProductos
} from "../services/carritoService";

function Checkout({ sesion }) {
    const [carrito, setCarrito] = useState(() => obtenerCarrito());
    const [direccion, setDireccion] = useState("");
    const [tipoEntrega, setTipoEntrega] = useState("DESPACHO");
    const [error, setError] = useState("");
    const [advertencias, setAdvertencias] = useState([]);
    const [pedidoCreado, setPedidoCreado] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [confirmando, setConfirmando] = useState(false);
    const [stockValido, setStockValido] = useState(false);
    const [intento, setIntento] = useState(0);

    const solicitudEnCurso = useRef(false);

    useEffect(() => {
        const controlador = new AbortController();

        async function verificarCarrito() {
            setCargando(true);
            setError("");
            setStockValido(false);

            try {
                const productos = await listarProductosApi({
                    signal: controlador.signal
                });

                if (controlador.signal.aborted) {
                    return;
                }

                const resultado = sincronizarCarritoConProductos(
                    productos
                );

                setCarrito(resultado.carrito);
                setAdvertencias(resultado.advertencias);

                setStockValido(
                    resultado.puedeContinuar &&
                    resultado.advertencias.length === 0
                );
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

        verificarCarrito();

        return () => controlador.abort();
    }, [intento]);

    const total = carrito.reduce(
        (acumulador, producto) =>
            acumulador +
            Number(producto.precio) * producto.cantidad,
        0
    );

    async function confirmarPedido(evento) {
        evento.preventDefault();

        if (solicitudEnCurso.current) {
            return;
        }

        setError("");

        if (cargando || !stockValido) {
            setError(
                "Debes revisar los precios y las existencias antes de confirmar."
            );
            return;
        }

        if (carrito.length === 0) {
            setError("No hay productos en el carrito.");
            return;
        }

        if (
            tipoEntrega === "DESPACHO" &&
            direccion.trim().length < 5
        ) {
            setError(
                "Ingresa una dirección de despacho válida."
            );
            return;
        }

        solicitudEnCurso.current = true;
        setConfirmando(true);

        try {
            const productosActuales = await listarProductosApi();

            const resultado = sincronizarCarritoConProductos(
                productosActuales
            );

            setCarrito(resultado.carrito);
            setAdvertencias(resultado.advertencias);

            if (
                !resultado.puedeContinuar ||
                resultado.advertencias.length > 0 ||
                resultado.carrito.length !== carrito.length ||
                resultado.carrito.length === 0
            ) {
                setStockValido(false);

                throw new Error(
                    "El catálogo cambió. Revisa nuevamente tu carrito antes de comprar."
                );
            }

            const productosPedido = resultado.carrito.map(
                (producto) => ({
                    codigo: producto.codigo,
                    cantidad: producto.cantidad,
                    precioEsperado: Number(producto.precio)
                })
            );

            const pedido = await crearPedidoApi({
                tipoEntrega,
                direccion: tipoEntrega === "RETIRO"
                    ? ""
                    : direccion.trim(),
                productos: productosPedido
            });

            vaciarCarrito();
            setCarrito([]);
            setPedidoCreado(pedido);
        } catch (excepcion) {
            setError(
                excepcion.message ||
                "No se pudo confirmar el pedido."
            );
        } finally {
            solicitudEnCurso.current = false;
            setConfirmando(false);
        }
    }

    if (pedidoCreado) {
        return (
            <section className="container py-5">
                <div
                    className="alert alert-success p-4"
                    role="status"
                >
                    <h2 className="h4 fw-bold">
                        Pedido confirmado
                    </h2>

                    <p>
                        Número de pedido:{" "}
                        <strong>#{pedidoCreado.id}</strong>
                    </p>

                    <p>
                        Estado: {pedidoCreado.estado}
                    </p>

                    <p>
                        Tipo de entrega:{" "}
                        {pedidoCreado.tipoEntrega === "RETIRO"
                            ? "Retiro en tienda"
                            : "Despacho a domicilio"}
                    </p>

                    <p>
                        {pedidoCreado.tipoEntrega === "RETIRO"
                            ? "Tu pedido será preparado para retiro."
                            : `Dirección: ${pedidoCreado.direccion}`}
                    </p>

                    <p className="fw-bold mb-0">
                        Total: $
                        {Number(pedidoCreado.total).toLocaleString("es-CL")}
                    </p>
                </div>

                <p className="text-secondary">
                    Tu compra fue registrada en MariaDB.
                    Puedes consultar su estado en Mis pedidos.
                </p>

                <div className="d-flex gap-2 flex-wrap">
                    <Link
                        to="/mis-pedidos"
                        className="btn btn-dark"
                    >
                        Ver mis pedidos
                    </Link>

                    <Link
                        to="/productos"
                        className="btn btn-outline-dark"
                    >
                        Volver al catálogo
                    </Link>
                </div>
            </section>
        );
    }

    return (
        <section className="container py-5">
            <h2 className="fw-bold">
                Finalizar compra
            </h2>

            <p className="text-secondary">
                Revisa los productos y selecciona el tipo de entrega.
            </p>

            {cargando && (
                <div className="alert alert-info" role="status">
                    Comprobando precios y stock en MariaDB...
                </div>
            )}

            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            {advertencias.map((advertencia, indice) => (
                <div
                    className="alert alert-warning"
                    key={`${indice}-${advertencia}`}
                >
                    {advertencia}
                </div>
            ))}

            {!cargando && !stockValido && (
                <div className="alert alert-warning">
                    <p>
                        No podemos confirmar la compra hasta
                        verificar las existencias y los precios.
                    </p>

                    <div className="d-flex flex-wrap gap-2">
                        <button
                            type="button"
                            className="btn btn-outline-dark"
                            onClick={() =>
                                setIntento((actual) => actual + 1)
                            }
                        >
                            Volver a verificar
                        </button>

                        <Link
                            to="/carrito"
                            className="btn btn-dark"
                        >
                            Revisar carrito
                        </Link>
                    </div>
                </div>
            )}

            <div className="row g-4">
                <div className="col-12 col-lg-7">
                    <div className="card p-4">
                        <h3 className="h5 mb-3">
                            Productos
                        </h3>

                        {carrito.length === 0 ? (
                            <p>
                                Tu carrito está vacío.
                            </p>
                        ) : (
                            carrito.map((producto) => (
                                <div
                                    key={producto.codigo}
                                    className="border-bottom py-3"
                                >
                                    <strong>
                                        {producto.nombre}
                                    </strong>

                                    <p className="mb-1">
                                        Cantidad: {producto.cantidad}
                                    </p>

                                    <p className="mb-0 text-secondary">
                                        Precio unitario: $
                                        {Number(producto.precio).toLocaleString("es-CL")}
                                    </p>
                                </div>
                            ))
                        )}

                        <h3 className="h5 mt-4">
                            Total: ${total.toLocaleString("es-CL")}
                        </h3>
                    </div>
                </div>

                <div className="col-12 col-lg-5">
                    <form
                        className="card p-4"
                        onSubmit={confirmarPedido}
                    >
                        <h3 className="h5 mb-3">
                            Datos de entrega
                        </h3>

                        <p className="text-secondary">
                            Cliente: {sesion.nombre}
                        </p>

                        <fieldset className="mb-4">
                            <legend className="form-label fw-bold fs-6">
                                Método de entrega
                            </legend>

                            <div className="form-check mb-2">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    id="tipoDespacho"
                                    name="tipoEntrega"
                                    value="DESPACHO"
                                    checked={tipoEntrega === "DESPACHO"}
                                    onChange={(evento) =>
                                        setTipoEntrega(evento.target.value)
                                    }
                                />

                                <label
                                    className="form-check-label"
                                    htmlFor="tipoDespacho"
                                >
                                    Despacho a domicilio
                                </label>
                            </div>

                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    id="tipoRetiro"
                                    name="tipoEntrega"
                                    value="RETIRO"
                                    checked={tipoEntrega === "RETIRO"}
                                    onChange={(evento) =>
                                        setTipoEntrega(evento.target.value)
                                    }
                                />

                                <label
                                    className="form-check-label"
                                    htmlFor="tipoRetiro"
                                >
                                    Retiro en tienda
                                </label>
                            </div>
                        </fieldset>

                        {tipoEntrega === "DESPACHO" ? (
                            <div className="mb-3">
                                <label
                                    htmlFor="direccion"
                                    className="form-label"
                                >
                                    Dirección de despacho
                                </label>

                                <input
                                    id="direccion"
                                    type="text"
                                    className="form-control"
                                    value={direccion}
                                    onChange={(evento) =>
                                        setDireccion(evento.target.value)
                                    }
                                    required
                                    minLength={5}
                                    maxLength={255}
                                    placeholder="Ej: Avenida Libertad 1234"
                                />
                            </div>
                        ) : (
                            <div
                                className="alert alert-info"
                                role="status"
                            >
                                Podrás retirar tu pedido cuando
                                esté listo.

                                <Link
                                    to="/ubicaciones"
                                    className="d-block mt-2"
                                >
                                    Ver ubicaciones
                                </Link>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn btn-dark w-100"
                            disabled={
                                cargando ||
                                confirmando ||
                                !stockValido ||
                                carrito.length === 0
                            }
                        >
                            {confirmando
                                ? "Registrando pedido..."
                                : "Confirmar pedido"}
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
}

export default Checkout;
