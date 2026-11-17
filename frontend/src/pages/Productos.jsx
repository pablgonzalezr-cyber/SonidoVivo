import { useEffect, useState } from "react";
import { listarProductosApi } from "../services/productosApi";
import ProductoCard from "../components/ProductoCard";

function Productos() {
    const [productos, setProductos] = useState([]);
    const [busqueda, setBusqueda] = useState("");
    const [categoria, setCategoria] = useState("Todas");
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [intento, setIntento] = useState(0);

    useEffect(() => {
        const controlador = new AbortController();

        async function cargarProductos() {
            setCargando(true);
            setError("");

            try {
                const datos = await listarProductosApi({
                    signal: controlador.signal
                });

                if (!controlador.signal.aborted) {
                    setProductos(datos);
                }
            } catch (excepcion) {
                if (!controlador.signal.aborted) {
                    setProductos([]);
                    setError(excepcion.message || "No se pudieron cargar los productos.");
                }
            } finally {
                if (!controlador.signal.aborted) {
                    setCargando(false);
                }
            }
        }

        cargarProductos();

        return () => controlador.abort();
    }, [intento]);

    const categorias = [...new Set(
        productos
            .map((producto) => producto.categoria?.trim())
            .filter(Boolean)
    )].sort((a, b) => a.localeCompare(b, "es"));

    const productosFiltrados = productos.filter((producto) => {
        const texto = busqueda.trim().toLowerCase();
        const coincideBusqueda =
            producto.nombre.toLowerCase().includes(texto) ||
            producto.marca.toLowerCase().includes(texto);

        const coincideCategoria =
            categoria === "Todas" || producto.categoria === categoria;

        return coincideBusqueda && coincideCategoria;
    });

    return (
        <section className="container py-5">
            <div className="mb-4">
                <h2 className="fw-bold">Catalogo de productos</h2>
                <p className="text-secondary">
                    Conoce los instrumentos y equipos disponibles en Sonido Vivo.
                </p>
            </div>

            {cargando && (
                <div className="alert alert-info" role="status">
                    Cargando productos desde el servidor...
                </div>
            )}

            {error && (
                <div className="alert alert-danger" role="alert">
                    <p className="mb-2">{error}</p>
                    <button
                        type="button"
                        className="btn btn-outline-danger"
                        onClick={() => setIntento((actual) => actual + 1)}
                    >
                        Reintentar
                    </button>
                </div>
            )}

            {!cargando && !error && (
                <>
                    <div className="row g-3 mb-4">
                        <div className="col-12 col-md-7">
                            <label htmlFor="buscarProducto" className="form-label">
                                Buscar producto
                            </label>
                            <input
                                id="buscarProducto"
                                type="text"
                                className="form-control"
                                placeholder="Ej: Yamaha, guitarra..."
                                value={busqueda}
                                onChange={(evento) => setBusqueda(evento.target.value)}
                            />
                        </div>

                        <div className="col-12 col-md-5">
                            <label htmlFor="categoriaProducto" className="form-label">
                                Categoria
                            </label>
                            <select
                                id="categoriaProducto"
                                className="form-select"
                                value={categoria}
                                onChange={(evento) => setCategoria(evento.target.value)}
                            >
                                <option value="Todas">Todas</option>
                                {categorias.map((nombreCategoria) => (
                                    <option key={nombreCategoria} value={nombreCategoria}>
                                        {nombreCategoria}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <p className="text-secondary">
                        Productos encontrados: {productosFiltrados.length}
                    </p>

                    <div className="row g-4">
                        {productosFiltrados.map((producto) => (
                            <div
                                className="col-12 col-md-6 col-lg-4"
                                key={producto.codigo}
                            >
                                <ProductoCard producto={producto} />
                            </div>
                        ))}
                    </div>

                    {productosFiltrados.length === 0 && (
                        <div className="alert alert-warning mt-4">
                            No encontramos productos con esos criterios.
                        </div>
                    )}
                </>
            )}
        </section>
    );
}

export default Productos;
