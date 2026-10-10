import { useState } from "react";

import {
    obtenerProductos,
    agregarProducto,
    actualizarProducto,
    eliminarProducto
} from "../services/productosService";


function GestionProductos() {

    const [productos, setProductos] =
        useState(obtenerProductos());


    const [codigo, setCodigo] =
        useState("");

    const [nombre, setNombre] =
        useState("");

    const [categoria, setCategoria] =
        useState("");

    const [marca, setMarca] =
        useState("");

    const [modelo, setModelo] =
        useState("");

    const [precio, setPrecio] =
        useState("");

    const [stock, setStock] =
        useState("");

    const [descripcion, setDescripcion] =
        useState("");


    const [editando, setEditando] =
        useState(false);

    const [mensaje, setMensaje] =
        useState("");

    const [error, setError] =
        useState("");
    
    const categoriasExistentes = [...new Set(
        productos
            .map((producto) => producto.categoria?.trim())
            .filter(Boolean)
    )].sort((a, b) => a.localeCompare(b, "es"));

    function limpiarFormulario() {

        setCodigo("");
        setNombre("");
        setCategoria("");
        setMarca("");
        setModelo("");
        setPrecio("");
        setStock("");
        setDescripcion("");

        setEditando(false);

    }


    function enviarFormulario(evento) {

        evento.preventDefault();

        setMensaje("");
        setError("");


        if (
            codigo.trim() === "" ||
            nombre.trim() === "" ||
            categoria.trim() === "" ||
            marca.trim() === "" ||
            modelo.trim() === "" ||
            precio === "" ||
            stock === ""
        ) {

            setError(
                "Completa todos los campos obligatorios."
            );

            return;

        }


        const precioNumero = Number(precio);
        const stockNumero = Number(stock);

        if (
            !Number.isSafeInteger(precioNumero) ||
            precioNumero <= 0 ||
            !Number.isSafeInteger(stockNumero) ||
            stockNumero < 0
        ) {
            setError(
                "El precio debe ser un entero positivo y el stock un entero igual o mayor que cero."
            );
            return;
        }



        const producto = {

            codigo:
                codigo.trim().toUpperCase(),

            nombre:
                nombre.trim(),

            categoria:
                categoria.trim(),

            marca:
                marca.trim(),

            modelo:
                modelo.trim(),

            precio: precioNumero,

            stock: stockNumero,

            descripcion:
                descripcion.trim()

        };


        if (editando) {

            actualizarProducto(producto);

            setMensaje(
                "Producto actualizado correctamente."
            );

        } else {

            const agregado =
                agregarProducto(producto);


            if (!agregado) {

                setError(
                    "Ya existe un producto con ese codigo."
                );

                return;

            }


            setMensaje(
                "Producto agregado correctamente."
            );

        }


        setProductos(
            obtenerProductos()
        );


        limpiarFormulario();

    }


    function seleccionarProducto(producto) {

        setCodigo(producto.codigo);

        setNombre(producto.nombre);

        setCategoria(producto.categoria);

        setMarca(producto.marca);

        setModelo(producto.modelo);

        setPrecio(producto.precio);

        setStock(producto.stock);

        setDescripcion(producto.descripcion);

        setEditando(true);

        setMensaje("");
        setError("");

    }


    function borrarProducto(codigoProducto) {

        const confirmar =
            window.confirm(
                "¿Deseas eliminar este producto?"
            );


        if (!confirmar) {

            return;

        }


        eliminarProducto(codigoProducto);


        setProductos(
            obtenerProductos()
        );


        setMensaje(
            "Producto eliminado correctamente."
        );


        if (codigo === codigoProducto) {

            limpiarFormulario();

        }

    }


    return (

        <section className="container py-5">

            <div className="mb-4">

                <h2 className="fw-bold">

                    Gestion de Productos

                </h2>


                <p className="text-secondary">

                    Crea, edita y elimina productos
                    del catalogo de Sonido Vivo.

                </p>

            </div>


            {error && (

                <div className="alert alert-danger">

                    {error}

                </div>

            )}


            {mensaje && (

                <div className="alert alert-success">

                    {mensaje}

                </div>

            )}


            <div className="card p-4 mb-5">

                <h3 className="h5 mb-3">

                    {editando
                        ? "Editar producto"
                        : "Nuevo producto"}

                </h3>


                <form onSubmit={enviarFormulario}>

                    <div className="row g-3">

                        <div className="col-md-4">

                            <label className="form-label">

                                Codigo

                            </label>


                            <input
                                type="text"
                                className="form-control"
                                value={codigo}
                                disabled={editando}
                                onChange={(evento) =>
                                    setCodigo(
                                        evento.target.value
                                    )
                                }
                            />

                        </div>


                        <div className="col-md-8">

                            <label className="form-label">

                                Nombre

                            </label>


                            <input
                                type="text"
                                className="form-control"
                                value={nombre}
                                onChange={(evento) =>
                                    setNombre(
                                        evento.target.value
                                    )
                                }
                            />

                        </div>


                        <div className="col-md-6">

                            <label className="form-label">

                                Categoria

                            </label>


                            <input
                                type="text"
                                className="form-control"
                                list="categoriasSugeridas"
                                value={categoria}
                                onChange={(evento) =>
                                    setCategoria(
                                        evento.target.value
                                    )
                                }
                            />

                            <datalist id="categoriasSugeridas">
                                    {categoriasExistentes.map((item) => (
                                        <option key={item} value={item} />
                                    ))}
                                </datalist>

                        </div>


                        <div className="col-md-3">

                            <label className="form-label">

                                Marca

                            </label>


                            <input
                                type="text"
                                className="form-control"
                                value={marca}
                                onChange={(evento) =>
                                    setMarca(
                                        evento.target.value
                                    )
                                }
                            />

                        </div>


                        <div className="col-md-3">

                            <label className="form-label">

                                Modelo

                            </label>


                            <input
                                type="text"
                                className="form-control"
                                value={modelo}
                                onChange={(evento) =>
                                    setModelo(
                                        evento.target.value
                                    )
                                }
                            />

                        </div>


                        <div className="col-md-3">

                            <label className="form-label">

                                Precio

                            </label>


                            <input
                                type="text"
                                min="1"
                                step="1"
                                className="form-control"
                                value={precio}
                                onChange={(evento) =>
                                    setPrecio(
                                        evento.target.value
                                    )
                                }
                            />

                        </div>


                        <div className="col-md-3">

                            <label className="form-label">

                                Stock

                            </label>


                            <input
                                type="tex"
                                min="0"
                                step="1"
                                className="form-control"
                                value={stock}
                                onChange={(evento) =>
                                    setStock(
                                        evento.target.value
                                    )
                                }
                            />

                        </div>


                        <div className="col-md-12">

                            <label className="form-label">

                                Descripcion

                            </label>


                            <textarea
                                className="form-control"
                                rows="3"
                                value={descripcion}
                                onChange={(evento) =>
                                    setDescripcion(
                                        evento.target.value
                                    )
                                }
                            >
                            </textarea>

                        </div>

                    </div>


                    <div className="mt-4 d-flex gap-2">

                        <button
                            type="submit"
                            className="btn btn-dark"
                        >

                            {editando
                                ? "Guardar cambios"
                                : "Agregar producto"}

                        </button>


                        {editando && (

                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={limpiarFormulario}
                            >

                                Cancelar

                            </button>

                        )}

                    </div>

                </form>

            </div>


            <h3 className="h4 mb-3">

                Productos actuales

            </h3>


            <div className="table-responsive">

                <table className="table table-striped align-middle">

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

                        {productos.map((producto) => (

                            <tr key={producto.codigo}>

                                <td>
                                    {producto.codigo}
                                </td>

                                <td>
                                    {producto.nombre}
                                </td>

                                <td>

                                    $
                                    {producto.precio
                                        .toLocaleString("es-CL")}

                                </td>

                                <td>
                                    {producto.stock}
                                </td>

                                <td>

                                    <div className="d-flex gap-2">

                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-dark"
                                            onClick={() =>
                                                seleccionarProducto(
                                                    producto
                                                )
                                            }
                                        >

                                            Editar

                                        </button>


                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() =>
                                                borrarProducto(
                                                    producto.codigo
                                                )
                                            }
                                        >

                                            Eliminar

                                        </button>

                                    </div>

                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

        </section>

    );

}


export default GestionProductos;
