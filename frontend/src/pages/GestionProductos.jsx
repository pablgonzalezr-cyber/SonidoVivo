import { useEffect, useState } from "react";

import {
    listarProductosApi,
    crearProductoApi,
    actualizarProductoApi,
    eliminarProductoApi
} from "../services/productosApi";

const formularioInicial = {
    codigo: "",
    nombre: "",
    categoria: "",
    marca: "",
    modelo: "",
    precio: "",
    stock: "",
    descripcion: "",
    imagen: ""
};

function GestionProductos() {
    const [productos, setProductos] = useState([]);
    const [formulario, setFormulario] = useState(formularioInicial);
    const [codigoEditando, setCodigoEditando] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [eliminando, setEliminando] = useState(null);
    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");

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

    const categoriasExistentes = [...new Set(
        productos
            .map((producto) => producto.categoria?.trim())
            .filter(Boolean)
    )].sort((a, b) => a.localeCompare(b, "es"));

    function cambiarCampo(evento) {
        const { name, value } = evento.target;

        setFormulario((actual) => ({
            ...actual,
            [name]: value
        }));
    }

    function limpiarFormulario() {
        setFormulario({ ...formularioInicial });
        setCodigoEditando(null);
    }

    async function recargarProductos() {
        setError("");
        setCargando(true);

        try {
            const datos = await listarProductosApi();
            setProductos(datos);
        } catch (excepcion) {
            setError(excepcion.message);
        } finally {
            setCargando(false);
        }
    }

    async function enviarFormulario(evento) {
        evento.preventDefault();

        setError("");
        setMensaje("");

        const datos = {
            codigo: formulario.codigo.trim().toUpperCase(),
            nombre: formulario.nombre.trim(),
            categoria: formulario.categoria.trim(),
            marca: formulario.marca.trim(),
            modelo: formulario.modelo.trim(),
            precio: Number(formulario.precio),
            stock: Number(formulario.stock),
            descripcion: formulario.descripcion.trim(),
            imagen: formulario.imagen.trim()
        };

        if (
            !/^[A-Z0-9-]{2,20}$/.test(datos.codigo) ||
            !datos.nombre ||
            !datos.categoria ||
            !datos.marca ||
            !datos.modelo ||
            formulario.precio === "" ||
            formulario.stock === ""
        ) {
            setError(
                "Completa los campos obligatorios. El código debe tener entre 2 y 20 letras, números o guiones."
            );
            return;
        }

        if (
            datos.nombre.length > 160 ||
            datos.categoria.length > 100 ||
            datos.marca.length > 100 ||
            datos.modelo.length > 100 ||
            datos.descripcion.length > 2000 ||
            datos.imagen.length > 255
        ) {
            setError(
                "Uno de los campos supera el máximo de caracteres permitido."
            );
            return;
        }

        if (
            !Number.isSafeInteger(datos.precio) ||
            datos.precio <= 0 ||
            datos.precio > 2147483647 ||
            !Number.isSafeInteger(datos.stock) ||
            datos.stock < 0 ||
            datos.stock > 2147483647
        ) {
            setError(
                "El precio debe ser un entero positivo y el stock un entero igual o mayor que cero."
            );
            return;
        }

        setGuardando(true);

        try {
            if (codigoEditando !== null) {
                const actualizado = await actualizarProductoApi(
                    codigoEditando,
                    datos
                );

                setProductos((actuales) =>
                    actuales.map((producto) =>
                        producto.codigo === codigoEditando
                            ? actualizado
                            : producto
                    )
                );

                setMensaje("Producto actualizado correctamente.");
            } else {
                const creado = await crearProductoApi(datos);

                setProductos((actuales) =>
                    [...actuales, creado].sort((a, b) =>
                        a.codigo.localeCompare(b.codigo)
                    )
                );

                setMensaje("Producto agregado correctamente.");
            }

            limpiarFormulario();
        } catch (excepcion) {
            setError(excepcion.message);
        } finally {
            setGuardando(false);
        }
    }

    function seleccionarProducto(producto) {
        setFormulario({
            codigo: producto.codigo,
            nombre: producto.nombre,
            categoria: producto.categoria,
            marca: producto.marca,
            modelo: producto.modelo,
            precio: String(producto.precio),
            stock: String(producto.stock),
            descripcion: producto.descripcion || "",
            imagen: producto.imagen || ""
        });

        setCodigoEditando(producto.codigo);
        setError("");
        setMensaje("");
    }

    async function borrarProducto(codigo) {
        if (!window.confirm("¿Deseas eliminar este producto?")) {
            return;
        }

        setError("");
        setMensaje("");
        setEliminando(codigo);

        try {
            await eliminarProductoApi(codigo);

            setProductos((actuales) =>
                actuales.filter((producto) =>
                    producto.codigo !== codigo
                )
            );

            if (codigoEditando === codigo) {
                limpiarFormulario();
            }

            setMensaje("Producto eliminado correctamente.");
        } catch (excepcion) {
            setError(excepcion.message);
        } finally {
            setEliminando(null);
        }
    }

    return (
        <section className="container py-5">
            <div className="mb-4">
                <h2 className="fw-bold">
                    Gestion de Productos
                </h2>

                <p className="text-secondary">
                    Crea, edita y elimina productos directamente
                    en la base de datos de Sonido Vivo.
                </p>
            </div>

            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            {mensaje && (
                <div className="alert alert-success" role="status">
                    {mensaje}
                </div>
            )}

            <div className="card p-4 mb-5">
                <h3 className="h5 mb-3">
                    {codigoEditando !== null
                        ? "Editar producto"
                        : "Nuevo producto"}
                </h3>

                <form onSubmit={enviarFormulario}>
                    <div className="row g-3">
                        <div className="col-md-4">
                            <label
                                htmlFor="codigoProducto"
                                className="form-label"
                            >
                                Codigo
                            </label>

                            <input
                                id="codigoProducto"
                                name="codigo"
                                type="text"
                                className="form-control"
                                value={formulario.codigo}
                                onChange={cambiarCampo}
                                disabled={codigoEditando !== null}
                                maxLength={20}
                                required
                            />
                        </div>

                        <div className="col-md-8">
                            <label
                                htmlFor="nombreProducto"
                                className="form-label"
                            >
                                Nombre
                            </label>

                            <input
                                id="nombreProducto"
                                name="nombre"
                                type="text"
                                className="form-control"
                                value={formulario.nombre}
                                onChange={cambiarCampo}
                                maxLength={160}
                                required
                            />
                        </div>

                        <div className="col-md-6">
                            <label
                                htmlFor="categoriaAdmin"
                                className="form-label"
                            >
                                Categoría
                            </label>

                            <input
                                id="categoriaAdmin"
                                name="categoria"
                                type="text"
                                className="form-control"
                                list="categoriasSugeridas"
                                value={formulario.categoria}
                                onChange={cambiarCampo}
                                maxLength={100}
                                required
                            />

                            <datalist id="categoriasSugeridas">
                                {categoriasExistentes.map((item) => (
                                    <option key={item} value={item} />
                                ))}
                            </datalist>
                        </div>

                        <div className="col-md-3">
                            <label
                                htmlFor="marcaProducto"
                                className="form-label"
                            >
                                Marca
                            </label>

                            <input
                                id="marcaProducto"
                                name="marca"
                                type="text"
                                className="form-control"
                                value={formulario.marca}
                                onChange={cambiarCampo}
                                maxLength={100}
                                required
                            />
                        </div>

                        <div className="col-md-3">
                            <label
                                htmlFor="modeloProducto"
                                className="form-label"
                            >
                                Modelo
                            </label>

                            <input
                                id="modeloProducto"
                                name="modelo"
                                type="text"
                                className="form-control"
                                value={formulario.modelo}
                                onChange={cambiarCampo}
                                maxLength={100}
                                required
                            />
                        </div>

                        <div className="col-md-3">
                            <label
                                htmlFor="precioProducto"
                                className="form-label"
                            >
                                Precio
                            </label>

                            <input
                                id="precioProducto"
                                name="precio"
                                type="number"
                                min="1"
                                max="2147483647"
                                step="1"
                                className="form-control"
                                value={formulario.precio}
                                onChange={cambiarCampo}
                                required
                            />
                        </div>

                        <div className="col-md-3">
                            <label
                                htmlFor="stockProducto"
                                className="form-label"
                            >
                                Stock
                            </label>

                            <input
                                id="stockProducto"
                                name="stock"
                                type="number"
                                min="0"
                                max="2147483647"
                                step="1"
                                className="form-control"
                                value={formulario.stock}
                                onChange={cambiarCampo}
                                required
                            />
                        </div>

                        <div className="col-md-6">
                            <label
                                htmlFor="imagenProducto"
                                className="form-label"
                            >
                                Imagen
                            </label>

                            <input
                                id="imagenProducto"
                                name="imagen"
                                type="text"
                                className="form-control"
                                value={formulario.imagen}
                                onChange={cambiarCampo}
                                maxLength={255}
                                placeholder="/imagenes/productos/GA001.jpg"
                            />

                            <small className="text-secondary">
                                Ruta de imagen o URL. Opcional.
                            </small>
                        </div>

                        <div className="col-12">
                            <label
                                htmlFor="descripcionProducto"
                                className="form-label"
                            >
                                Descripcion
                            </label>

                            <textarea
                                id="descripcionProducto"
                                name="descripcion"
                                className="form-control"
                                rows={3}
                                value={formulario.descripcion}
                                onChange={cambiarCampo}
                                maxLength={2000}
                            />
                        </div>
                    </div>

                    <div className="mt-4 d-flex flex-wrap gap-2">
                        <button
                            type="submit"
                            className="btn btn-dark"
                            disabled={guardando || cargando || eliminando !== null}
                        >
                            {guardando
                                ? "Guardando..."
                                : codigoEditando !== null
                                    ? "Guardar cambios"
                                    : "Agregar producto"}
                        </button>

                        {codigoEditando !== null && (
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={limpiarFormulario}
                                disabled={guardando}
                            >
                                Cancelar
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className="d-flex align-items-center justify-content-between mb-3">
                <h3 className="h4 mb-0">
                    Productos actuales ({productos.length})
                </h3>

                <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={recargarProductos}
                    disabled={cargando || guardando || eliminando !== null}
                >
                    Actualizar lista
                </button>
            </div>

            {cargando ? (
                <div className="alert alert-info" role="status">
                    Cargando productos desde MariaDB...
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-striped align-middle tabla-productos">
                        <thead>
                            <tr>
                                <th>Codigo</th>
                                <th>Producto</th>
                                <th>Precio</th>
                                <th>Stock</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>

                        <tbody>
                            {productos.length === 0 && (
                                <tr>
                                    <td colSpan={5}>
                                        No hay productos para mostrar.
                                    </td>
                                </tr>
                            )}

                            {productos.map((producto) => (
                                <tr key={producto.codigo}>
                                    <td>{producto.codigo}</td>
                                    <td>{producto.nombre}</td>
                                    <td>
                                        ${Number(producto.precio).toLocaleString("es-CL")}
                                    </td>
                                    <td>{producto.stock}</td>
                                    <td>
                                        <div className="d-flex flex-wrap gap-2">
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-dark"
                                                disabled={guardando || eliminando !== null}
                                                onClick={() =>
                                                    seleccionarProducto(producto)
                                                }
                                            >
                                                Editar
                                            </button>

                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-danger"
                                                disabled={guardando || eliminando !== null}
                                                onClick={() =>
                                                    borrarProducto(producto.codigo)
                                                }
                                            >
                                                {eliminando === producto.codigo
                                                    ? "Eliminando..."
                                                    : "Eliminar"}
                                            </button>
                                        </div>
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

export default GestionProductos;
