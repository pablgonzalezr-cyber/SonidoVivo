import { useEffect, useState } from "react";
import { listarProductosApi, listarCategoriasApi } from "../services/productosApi";
import ProductoCard from "../components/ProductoCard";

const filtrosIniciales = {
    texto: "",
    categoria: "Todas",
    precioMin: "",
    precioMax: "",
    disponible: false,
    orden: "codigo"
};

function Productos() {
    const [filtros, setFiltros] = useState(filtrosIniciales);
    const [categorias, setCategorias] = useState([]);
    const [productos, setProductos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [intento, setIntento] = useState(0);

    useEffect(() => {
        const controlador = new AbortController();
        listarCategoriasApi({ signal: controlador.signal })
            .then((datos) => {
                if (!controlador.signal.aborted) setCategorias(datos);
            })
            .catch((excepcion) => {
                if (!controlador.signal.aborted) setError(excepcion.message);
            });
        return () => controlador.abort();
    }, []);

    const rangoInvalido = Boolean(
        filtros.precioMin !== "" && filtros.precioMax !== "" &&
        Number(filtros.precioMin) > Number(filtros.precioMax)
    );

    useEffect(() => {
        if (rangoInvalido) {
            setCargando(false);
            return;
        }

        const controlador = new AbortController();
        setCargando(true);
        setError("");

        listarProductosApi({ signal: controlador.signal, filtros })
            .then((datos) => {
                if (!controlador.signal.aborted) setProductos(datos);
            })
            .catch((excepcion) => {
                if (!controlador.signal.aborted) {
                    setProductos([]);
                    setError(excepcion.message);
                }
            })
            .finally(() => {
                if (!controlador.signal.aborted) setCargando(false);
            });

        return () => controlador.abort();
    }, [filtros, intento, rangoInvalido]);

    function cambiar(evento) {
        const { name, value, type, checked } = evento.target;
        setFiltros((actual) => ({
            ...actual,
            [name]: type === "checkbox" ? checked : value
        }));
    }

    return (
        <section className="container py-5">
            <h2 className="fw-bold">Catalogo de productos</h2>
            <p className="text-secondary">
                Filtra los instrumentos consultando directamente MariaDB.
            </p>

            <div className="card p-3 mb-4">
                <div className="row g-3">
                    <div className="col-12 col-lg-6">
                        <label htmlFor="buscarProducto" className="form-label">Buscar producto</label>
                        <input id="buscarProducto" name="texto" className="form-control"
                            placeholder="Nombre, marca o modelo" value={filtros.texto}
                            onChange={cambiar} />
                    </div>
                    <div className="col-12 col-lg-6">
                        <label htmlFor="categoriaProducto" className="form-label">Categoria</label>
                        <select id="categoriaProducto" name="categoria" className="form-select"
                            value={filtros.categoria} onChange={cambiar}>
                            <option value="Todas">Todas</option>
                            {categorias.map((nombre) => (
                                <option key={nombre} value={nombre}>{nombre}</option>
                            ))}
                        </select>
                    </div>
                    <div className="col-12 col-md-3">
                        <label htmlFor="precioMin" className="form-label">Precio mínimo</label>
                        <input id="precioMin" name="precioMin" type="number" min="0" step="1"
                            className="form-control" value={filtros.precioMin} onChange={cambiar} />
                    </div>
                    <div className="col-12 col-md-3">
                        <label htmlFor="precioMax" className="form-label">Precio máximo</label>
                        <input id="precioMax" name="precioMax" type="number" min="0" step="1"
                            className="form-control" value={filtros.precioMax} onChange={cambiar} />
                    </div>
                    <div className="col-12 col-md-4">
                        <label htmlFor="ordenCatalogo" className="form-label">Ordenar por</label>
                        <select id="ordenCatalogo" name="orden" className="form-select"
                            value={filtros.orden} onChange={cambiar}>
                            <option value="codigo">Código</option>
                            <option value="nombre_asc">Nombre A–Z</option>
                            <option value="nombre_desc">Nombre Z–A</option>
                            <option value="precio_asc">Precio menor a mayor</option>
                            <option value="precio_desc">Precio mayor a menor</option>
                        </select>
                    </div>
                    <div className="col-12 col-md-2 d-flex align-items-end">
                        <div className="form-check mb-2">
                            <input id="soloDisponibles" name="disponible" type="checkbox"
                                className="form-check-input" checked={filtros.disponible}
                                onChange={cambiar} />
                            <label htmlFor="soloDisponibles" className="form-check-label">
                                Con stock
                            </label>
                        </div>
                    </div>
                </div>
                <div className="mt-3">
                    <button type="button" className="btn btn-outline-secondary"
                        onClick={() => setFiltros({ ...filtrosIniciales })}>
                        Limpiar filtros
                    </button>
                </div>
            </div>

            {rangoInvalido && (
                <div className="alert alert-warning" role="alert">
                    El precio mínimo no puede ser mayor que el máximo.
                </div>
            )}
            {cargando && !rangoInvalido && (
                <div className="alert alert-info" role="status">
                    Consultando productos en MariaDB...
                </div>
            )}
            {error && !rangoInvalido && (
                <div className="alert alert-danger" role="alert">
                    {error}
                    <button type="button" className="btn btn-outline-danger ms-3"
                        onClick={() => setIntento((actual) => actual + 1)}>
                        Reintentar
                    </button>
                </div>
            )}

            {!cargando && !error && !rangoInvalido && (
                <>
                    <p className="text-secondary">Productos encontrados: {productos.length}</p>
                    <div className="row g-4">
                        {productos.map((producto) => (
                            <div className="col-12 col-md-6 col-lg-4" key={producto.codigo}>
                                <ProductoCard producto={producto} />
                            </div>
                        ))}
                    </div>
                    {productos.length === 0 && (
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