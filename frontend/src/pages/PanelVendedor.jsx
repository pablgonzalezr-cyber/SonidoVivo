import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listarProductosApi, actualizarStockApi } from "../services/productosApi";
import { obtenerResumenInventarioApi, listarMovimientosStockApi } from "../services/inventarioApi";

function formatearFecha(valor) {
    const fecha = new Date(valor);
    return Number.isNaN(fecha.getTime()) ? "Sin fecha" : fecha.toLocaleString("es-CL");
}

function PanelVendedor() {
    const [productos, setProductos] = useState([]);
    const [stocks, setStocks] = useState({});
    const [resumen, setResumen] = useState(null);
    const [movimientos, setMovimientos] = useState([]);
    const [umbral, setUmbral] = useState("5");
    const [codigoHistorial, setCodigoHistorial] = useState("");
    const [cargando, setCargando] = useState(true);
    const [guardandoCodigo, setGuardandoCodigo] = useState(null);
    const [mensaje, setMensaje] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const controlador = new AbortController();
        Promise.all([
            listarProductosApi({ signal: controlador.signal }),
            obtenerResumenInventarioApi(5, { signal: controlador.signal }),
            listarMovimientosStockApi("", { signal: controlador.signal })
        ]).then(([lista, estadisticas, historial]) => {
            if (!controlador.signal.aborted) {
                setProductos(lista);
                setResumen(estadisticas);
                setMovimientos(historial);
            }
        }).catch((excepcion) => {
            if (!controlador.signal.aborted) setError(excepcion.message);
        }).finally(() => {
            if (!controlador.signal.aborted) setCargando(false);
        });
        return () => controlador.abort();
    }, []);

    async function actualizarDatos(codigo = codigoHistorial) {
        const numero = Number(umbral);
        if (!Number.isSafeInteger(numero) || numero < 0 || numero > 100000) {
            setError("El umbral debe ser un entero entre 0 y 100000.");
            return;
        }
        setCargando(true);
        setError("");
        try {
            const [lista, estadisticas, historial] = await Promise.all([
                listarProductosApi(),
                obtenerResumenInventarioApi(numero),
                listarMovimientosStockApi(codigo)
            ]);
            setProductos(lista);
            setResumen(estadisticas);
            setMovimientos(historial);
            setStocks({});
        } catch (excepcion) {
            setError(excepcion.message);
        } finally {
            setCargando(false);
        }
    }

    async function guardarStock(codigo) {
        const original = productos.find((p) => p.codigo === codigo);
        if (!original) return;
        const valor = stocks[codigo] ?? String(original.stock);
        const nuevo = Number(valor);
        if (String(valor).trim() === "" || !Number.isSafeInteger(nuevo) ||
            nuevo < 0 || nuevo > 2147483647) {
            setError("El stock debe ser un entero mayor o igual a cero.");
            return;
        }
        setError("");
        setMensaje("");
        setGuardandoCodigo(codigo);
        try {
            await actualizarStockApi(codigo, nuevo);
            setMensaje(`Stock de ${original.nombre} actualizado y registrado en el historial.`);
            await actualizarDatos(codigoHistorial);
        } catch (excepcion) {
            setError(excepcion.message);
        } finally {
            setGuardandoCodigo(null);
        }
    }

    return (
        <section className="container py-5">
            <h2 className="fw-bold">Panel de Vendedor</h2>
            <p className="text-secondary">
                Inventario real: alertas, ajustes de stock e historial persistente en MariaDB.
            </p>
            <div className="d-flex flex-wrap gap-2 mb-4">
                <Link to="/admin/pedidos" className="btn btn-dark">Gestionar pedidos</Link>
                <button type="button" className="btn btn-outline-secondary"
                    disabled={cargando || guardandoCodigo !== null}
                    onClick={() => actualizarDatos()}>
                    Actualizar inventario
                </button>
            </div>

            {mensaje && <div className="alert alert-success" role="status">{mensaje}</div>}
            {error && <div className="alert alert-danger" role="alert">{error}</div>}
            {cargando && <div className="alert alert-info" role="status">Cargando inventario...</div>}

            {resumen && (
                <>
                    <div className="row g-3 mb-4">
                        {[
                            ["Productos", resumen.totalProductos],
                            ["Unidades en stock", resumen.unidadesTotales],
                            ["Agotados", resumen.agotados],
                            ["Stock bajo", resumen.stockBajo]
                        ].map(([titulo, numero]) => (
                            <div className="col-6 col-lg-3" key={titulo}>
                                <div className="card p-3 h-100">
                                    <h3 className="h6 text-secondary">{titulo}</h3>
                                    <strong className="fs-3">{numero}</strong>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="card p-3 mb-4">
                        <div className="d-flex flex-wrap align-items-end gap-2 mb-3">
                            <div>
                                <label htmlFor="umbralStock" className="form-label">Umbral de alerta</label>
                                <input id="umbralStock" type="number" min="0" max="100000"
                                    className="form-control" value={umbral}
                                    onChange={(evento) => setUmbral(evento.target.value)} />
                            </div>
                            <button type="button" className="btn btn-outline-dark"
                                onClick={() => actualizarDatos()} disabled={cargando}>
                                Aplicar umbral
                            </button>
                        </div>
                        <h3 className="h5">Alertas de existencias</h3>
                        {resumen.alertas.length === 0 ? (
                            <p className="text-success">No hay productos en alerta.</p>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-sm align-middle">
                                    <thead><tr><th>Código</th><th>Producto</th><th>Stock</th><th>Alerta</th></tr></thead>
                                    <tbody>
                                        {resumen.alertas.map((p) => (
                                            <tr key={p.codigo}>
                                                <td>{p.codigo}</td><td>{p.nombre}</td>
                                                <td>{p.stock}</td>
                                                <td>{p.stock === 0 ? "Agotado" : "Stock bajo"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}

            <div className="card p-3 mb-4">
                <h3 className="h5">Ajustar stock</h3>
                {productos.length === 0 && !cargando ? <p>No hay productos.</p> : (
                    <div className="table-responsive">
                        <table className="table table-striped align-middle">
                            <thead><tr><th>Código</th><th>Producto</th><th>Stock actual</th><th>Nuevo stock</th><th>Acción</th></tr></thead>
                            <tbody>
                                {productos.map((p) => (
                                    <tr key={p.codigo}>
                                        <td>{p.codigo}</td><td>{p.nombre}</td><td>{p.stock}</td>
                                        <td>
                                            <input type="number" min="0" max="2147483647" step="1"
                                                className="form-control"
                                                aria-label={`Nuevo stock de ${p.nombre}`}
                                                disabled={guardandoCodigo !== null || cargando}
                                                value={stocks[p.codigo] ?? String(p.stock)}
                                                onChange={(evento) => setStocks((actual) => ({
                                                    ...actual, [p.codigo]: evento.target.value
                                                }))} />
                                        </td>
                                        <td><button type="button" className="btn btn-dark btn-sm"
                                            disabled={guardandoCodigo !== null || cargando}
                                            onClick={() => guardarStock(p.codigo)}>
                                            {guardandoCodigo === p.codigo ? "Guardando..." : "Guardar"}
                                        </button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="card p-3">
                <h3 className="h5">Últimos 100 movimientos de stock</h3>
                <div className="d-flex flex-wrap gap-2 align-items-end mb-3">
                    <div>
                        <label htmlFor="codigoHistorial" className="form-label">Filtrar por producto</label>
                        <select id="codigoHistorial" className="form-select"
                            value={codigoHistorial}
                            onChange={(evento) => setCodigoHistorial(evento.target.value)}>
                            <option value="">Todos</option>
                            {productos.map((p) => <option key={p.codigo} value={p.codigo}>{p.codigo}</option>)}
                        </select>
                    </div>
                    <button className="btn btn-outline-dark" type="button" disabled={cargando}
                        onClick={() => actualizarDatos()}>
                        Filtrar historial
                    </button>
                </div>
                {movimientos.length === 0 ? (
                    <p className="text-secondary">Aún no hay movimientos registrados desde la activación de esta función.</p>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-striped table-sm align-middle">
                            <thead><tr><th>Fecha</th><th>Código</th><th>Tipo</th><th>Antes</th><th>Después</th><th>Variación</th><th>Usuario</th><th>Pedido</th></tr></thead>
                            <tbody>
                                {movimientos.map((m) => (
                                    <tr key={m.id}>
                                        <td>{formatearFecha(m.fecha)}</td>
                                        <td>{m.codigoProducto}</td>
                                        <td>{m.tipo}</td><td>{m.stockAntes}</td><td>{m.stockDespues}</td>
                                        <td>{m.variacion > 0 ? `+${m.variacion}` : m.variacion}</td>
                                        <td>{m.usuarioId == null ? "—" : `#${m.usuarioId}`}</td>
                                        <td>{m.pedidoId == null ? "—" : `#${m.pedidoId}`}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </section>
    );
}

export default PanelVendedor;
