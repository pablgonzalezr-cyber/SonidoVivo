import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
    listarProductosApi,
    actualizarStockApi
} from "../services/productosApi";

function PanelVendedor() {
    const [productos, setProductos] = useState([]);
    const [stocks, setStocks] = useState({});
    const [cargando, setCargando] = useState(true);
    const [guardandoCodigo, setGuardandoCodigo] = useState(null);
    const [mensaje, setMensaje] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const controlador = new AbortController();

        listarProductosApi({ signal: controlador.signal })
            .then((datos) => {
                if (!controlador.signal.aborted) {
                    setProductos(datos);
                }
            })
            .catch((excepcion) => {
                if (!controlador.signal.aborted) {
                    setError(excepcion.message);
                }
            })
            .finally(() => {
                if (!controlador.signal.aborted) {
                    setCargando(false);
                }
            });

        return () => controlador.abort();
    }, []);

    async function recargarProductos() {
        setCargando(true);
        setError("");

        try {
            const datos = await listarProductosApi();
            setProductos(datos);
            setStocks({});
        } catch (excepcion) {
            setError(excepcion.message);
        } finally {
            setCargando(false);
        }
    }

    function cambiarStock(codigo, valor) {
        setStocks((actuales) => ({
            ...actuales,
            [codigo]: valor
        }));
    }

    async function guardarStock(codigo) {
        setMensaje("");
        setError("");

        const producto = productos.find(
            (item) => item.codigo === codigo
        );

        if (!producto) {
            setError("El producto no existe.");
            return;
        }

        const valor = stocks[codigo] ?? String(producto.stock);
        const nuevoStock = Number(valor);

        if (
            String(valor).trim() === "" ||
            !Number.isSafeInteger(nuevoStock) ||
            nuevoStock < 0 ||
            nuevoStock > 2147483647
        ) {
            setError(
                "Ingresa un stock entero entre 0 y 2147483647."
            );
            return;
        }

        setGuardandoCodigo(codigo);

        try {
            const actualizado = await actualizarStockApi(
                codigo,
                nuevoStock
            );

            setProductos((actuales) =>
                actuales.map((item) =>
                    item.codigo === codigo
                        ? actualizado
                        : item
                )
            );

            setStocks((actuales) => {
                const nuevos = { ...actuales };
                delete nuevos[codigo];
                return nuevos;
            });

            setMensaje(
                `Stock de ${actualizado.nombre} actualizado correctamente.`
            );
        } catch (excepcion) {
            setError(excepcion.message);
        } finally {
            setGuardandoCodigo(null);
        }
    }

    return (
        <section className="container py-5">
            <h2 className="fw-bold">
                Panel de Vendedor
            </h2>

            <p className="text-secondary">
                Consulta productos y actualiza sus existencias
                directamente en MariaDB.
            </p>

            <div className="d-flex flex-wrap gap-2 mb-4">
                <Link
                    to="/admin/pedidos"
                    className="btn btn-dark"
                >
                    Gestionar pedidos
                </Link>

                <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={recargarProductos}
                    disabled={cargando || guardandoCodigo !== null}
                >
                    Actualizar lista
                </button>
            </div>

            {mensaje && (
                <div className="alert alert-success" role="status">
                    {mensaje}
                </div>
            )}

            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            {cargando ? (
                <div className="alert alert-info" role="status">
                    Cargando inventario desde MariaDB...
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-striped align-middle">
                        <thead>
                            <tr>
                                <th>Codigo</th>
                                <th>Producto</th>
                                <th>Stock actual</th>
                                <th>Nuevo stock</th>
                                <th>Accion</th>
                            </tr>
                        </thead>

                        <tbody>
                            {productos.length === 0 && (
                                <tr>
                                    <td colSpan={5}>
                                        No hay productos registrados.
                                    </td>
                                </tr>
                            )}

                            {productos.map((producto) => (
                                <tr key={producto.codigo}>
                                    <td>{producto.codigo}</td>
                                    <td>{producto.nombre}</td>
                                    <td>{producto.stock}</td>

                                    <td>
                                        <input
                                            type="number"
                                            min="0"
                                            max="2147483647"
                                            step="1"
                                            className="form-control"
                                            aria-label={`Nuevo stock de ${producto.nombre}`}
                                            value={
                                                stocks[producto.codigo] ??
                                                String(producto.stock)
                                            }
                                            onChange={(evento) =>
                                                cambiarStock(
                                                    producto.codigo,
                                                    evento.target.value
                                                )
                                            }
                                            disabled={
                                                guardandoCodigo !== null
                                            }
                                        />
                                    </td>

                                    <td>
                                        <button
                                            type="button"
                                            className="btn btn-dark btn-sm"
                                            onClick={() =>
                                                guardarStock(producto.codigo)
                                            }
                                            disabled={
                                                guardandoCodigo !== null
                                            }
                                        >
                                            {guardandoCodigo === producto.codigo
                                                ? "Guardando..."
                                                : "Guardar"}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}

export default PanelVendedor;
