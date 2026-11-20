
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { listarProductosApi } from "../services/productosApi";

import {
    obtenerCarrito,
    eliminarDelCarrito,
    sincronizarCarritoConProductos
} from "../services/carritoService";

function Carrito() {
    const [carrito, setCarrito] = useState(() => obtenerCarrito());
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [advertencias, setAdvertencias] = useState([]);
    const [puedeContinuar, setPuedeContinuar] = useState(false);
    const [intento, setIntento] = useState(0);

    useEffect(() => {
        const controlador = new AbortController();

        setCargando(true);
        setError("");
        setPuedeContinuar(false);

        async function verificarCarrito() {
            try {
                if (obtenerCarrito().length === 0) {
                    setCarrito([]);
                    setAdvertencias([]);
                    setPuedeContinuar(true);
                    return;
                }

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
                setPuedeContinuar(resultado.puedeContinuar);
            } catch (excepcion) {
                if (!controlador.signal.aborted) {
                    setError(
                        excepcion.message ||
                        "No se pudo verificar el carrito."
                    );
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

    function eliminarProducto(codigo) {
        const nuevoCarrito = eliminarDelCarrito(codigo);
        setCarrito(nuevoCarrito);
        setIntento((actual) => actual + 1);
    }

    const total = carrito.reduce(
        (acumulador, producto) =>
            acumulador +
            Number(producto.precio) * producto.cantidad,
        0
    );

    return (
        <section className="container py-5">
            <h2 className="fw-bold mb-4">
                Carrito de compras
            </h2>

            {cargando && (
                <div className="alert alert-info" role="status">
                    Verificando precios y stock en MariaDB...
                </div>
            )}

            {error && (
                <div className="alert alert-danger" role="alert">
                    <p className="mb-2">{error}</p>

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

            {!cargando && !error && (
                <>
                    {advertencias.map((advertencia, indice) => (
                        <div
                            className="alert alert-warning"
                            role="status"
                            key={`${indice}-${advertencia}`}
                        >
                            {advertencia}
                        </div>
                    ))}

                    {carrito.length === 0 ? (
                        <div className="alert alert-secondary">
                            <p>Tu carrito está vacío.</p>

                            <Link
                                to="/productos"
                                className="btn btn-dark"
                            >
                                Ver productos
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="row g-3">
                                {carrito.map((producto) => (
                                    <div
                                        className="col-12"
                                        key={producto.codigo}
                                    >
                                        <div className="card p-3">
                                            <div className="row align-items-center g-3">
                                                <div className="col-md-5">
                                                    <h3 className="h5">
                                                        {producto.nombre}
                                                    </h3>

                                                    <p className="mb-1 text-secondary">
                                                        {producto.marca}
                                                        {" · "}
                                                        {producto.modelo}
                                                    </p>

                                                    <small className="text-secondary">
                                                        Precio unitario: $
                                                        {Number(producto.precio).toLocaleString("es-CL")}
                                                    </small>
                                                </div>

                                                <div className="col-md-2">
                                                    Cantidad:{" "}
                                                    <strong>
                                                        {producto.cantidad}
                                                    </strong>

                                                    <div className="small text-secondary">
                                                        Stock: {producto.stock}
                                                    </div>
                                                </div>

                                                <div className="col-md-3 fw-bold">
                                                    $
                                                    {(
                                                        Number(producto.precio) *
                                                        producto.cantidad
                                                    ).toLocaleString("es-CL")}
                                                </div>

                                                <div className="col-md-2">
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-danger w-100"
                                                        onClick={() =>
                                                            eliminarProducto(
                                                                producto.codigo
                                                            )
                                                        }
                                                    >
                                                        Eliminar
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="text-end mt-4">
                                <h3>
                                    Total: ${total.toLocaleString("es-CL")}
                                </h3>

                                {puedeContinuar ? (
                                    <Link
                                        to="/checkout"
                                        className="btn btn-dark mt-2"
                                    >
                                        Finalizar compra
                                    </Link>
                                ) : (
                                    <div className="mt-2">
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            disabled
                                        >
                                            Revisar stock antes de continuar
                                        </button>

                                        <p className="text-danger small mt-2">
                                            Elimina los artículos sin stock
                                            suficiente y vuelve a agregarlos
                                            desde el catálogo.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </>
            )}
        </section>
    );
}

export default Carrito;
