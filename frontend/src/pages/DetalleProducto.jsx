import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { obtenerProductoApi } from "../services/productosApi";

import {
    agregarAlCarrito,
    obtenerCarrito
} from "../services/carritoService";

import {
    obtenerImagenProducto,
    usarImagenRespaldo
} from "../utils/imagenesProductos";

function DetalleProducto() {
    const { codigo } = useParams();

    const [producto, setProducto] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [errorCarga, setErrorCarga] = useState("");
    const [errorCarrito, setErrorCarrito] = useState("");
    const [agregado, setAgregado] = useState(false);
    const [cantidadEnCarrito, setCantidadEnCarrito] = useState(0);
    const [intento, setIntento] = useState(0);

    useEffect(() => {
        const controlador = new AbortController();

        setCargando(true);
        setErrorCarga("");
        setErrorCarrito("");
        setAgregado(false);
        setProducto(null);

        const item = obtenerCarrito().find(
            (actual) => actual.codigo === codigo
        );

        setCantidadEnCarrito(item?.cantidad || 0);

        async function cargarDetalle() {
            try {
                const datos = await obtenerProductoApi(codigo, {
                    signal: controlador.signal
                });

                if (!controlador.signal.aborted) {
                    setProducto(datos);
                }
            } catch (error) {
                if (!controlador.signal.aborted) {
                    setErrorCarga(error.message);
                }
            } finally {
                if (!controlador.signal.aborted) {
                    setCargando(false);
                }
            }
        }

        cargarDetalle();

        return () => controlador.abort();
    }, [codigo, intento]);

    function agregarProducto() {
        setErrorCarrito("");
        setAgregado(false);

        try {
            agregarAlCarrito(producto);

            const item = obtenerCarrito().find(
                (actual) => actual.codigo === producto.codigo
            );

            setCantidadEnCarrito(item?.cantidad || 0);
            setAgregado(true);
        } catch (error) {
            setErrorCarrito(error.message);
        }
    }

    if (cargando) {
        return (
            <section className="container py-5">
                <div className="alert alert-info" role="status">
                    Cargando detalle del producto desde MariaDB...
                </div>
            </section>
        );
    }

    if (errorCarga) {
        const noEncontrado = /no existe/i.test(errorCarga);

        return (
            <section className="container py-5">
                <h2 className="fw-bold">
                    {noEncontrado
                        ? "Producto no encontrado"
                        : "No se pudo cargar el producto"}
                </h2>

                <div className="alert alert-danger" role="alert">
                    {errorCarga}
                </div>

                <div className="d-flex flex-wrap gap-2">
                    <button
                        type="button"
                        className="btn btn-dark"
                        onClick={() => setIntento((actual) => actual + 1)}
                    >
                        Reintentar
                    </button>

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

    if (!producto) {
        return (
            <section className="container py-5 text-center">
                <h2>Producto no encontrado</h2>

                <Link to="/productos" className="btn btn-dark">
                    Volver al catálogo
                </Link>
            </section>
        );
    }

    const stockDisponible = Math.max(
        0,
        Number(producto.stock) - cantidadEnCarrito
    );

    return (
        <section className="container py-5">
            <Link
                to="/productos"
                className="btn btn-outline-dark mb-4"
            >
                ← Volver al catálogo
            </Link>

            <div className="row g-4">
                <div className="col-12 col-md-5">
                    <img
                        src={obtenerImagenProducto(producto)}
                        alt={`Imagen de ${producto.nombre}`}
                        className="sv-foto-detalle rounded"
                        onError={usarImagenRespaldo}
                    />
                </div>

                <div className="col-12 col-md-7">
                    <span className="badge bg-secondary mb-3">
                        {producto.categoria}
                    </span>

                    <h2 className="fw-bold">
                        {producto.nombre}
                    </h2>

                    <p className="text-secondary">
                        {producto.marca}
                        {" · "}
                        {producto.modelo}
                    </p>

                    <p>{producto.descripcion}</p>

                    <h3 className="h4 fw-bold">
                        ${Number(producto.precio).toLocaleString("es-CL")}
                    </h3>

                    <p>
                        Unidades disponibles para agregar:{" "}
                        <strong>{stockDisponible}</strong>
                    </p>

                    <p className="text-secondary">
                        Código: {producto.codigo}
                    </p>

                    <button
                        type="button"
                        className="btn btn-dark mt-3"
                        onClick={agregarProducto}
                        disabled={stockDisponible <= 0}
                    >
                        {stockDisponible <= 0
                            ? "Sin unidades disponibles"
                            : "Agregar al carrito"}
                    </button>

                    {agregado && (
                        <div
                            className="alert alert-success mt-3"
                            role="status"
                        >
                            Producto agregado al carrito.{" "}
                            <Link to="/carrito">
                                Ver carrito
                            </Link>
                        </div>
                    )}

                    {errorCarrito && (
                        <div
                            className="alert alert-danger mt-3"
                            role="alert"
                        >
                            {errorCarrito}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

export default DetalleProducto;
