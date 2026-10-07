import { useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
    obtenerProductoPorCodigo
} from "../services/productosService";

import {
    agregarAlCarrito
} from "../services/carritoService";


function DetalleProducto() {

    const { codigo } = useParams();

    const [agregado, setAgregado] = useState(false);


    const producto =
    obtenerProductoPorCodigo(codigo);


    if (!producto) {

        return (

            <section className="container py-5 text-center">

                <h2>
                    Producto no encontrado
                </h2>


                <p className="text-secondary">

                    El producto solicitado
                    no existe en el catalogo.

                </p>


                <Link
                    to="/productos"
                    className="btn btn-dark"
                >

                    Volver al catalogo

                </Link>

            </section>

        );

    }


    function agregarProducto() {

        agregarAlCarrito(producto);

        setAgregado(true);

    }


    return (

        <section className="container py-5">

            <Link
                to="/productos"
                className="btn btn-outline-dark mb-4"
            >

                ← Volver al catalogo

            </Link>


            <div className="row g-4">

                <div className="col-12 col-md-5">

                    <div className="producto-imagen-placeholder rounded">

                        ♫

                    </div>

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


                    <p>

                        {producto.descripcion}

                    </p>


                    <h3 className="h4 fw-bold">

                        $
                        {producto.precio.toLocaleString("es-CL")}

                    </h3>


                    <p>

                        Stock disponible:
                        {" "}
                        {producto.stock}

                    </p>


                    <p className="text-secondary">

                        Codigo:
                        {" "}
                        {producto.codigo}

                    </p>


                    <button
                        className="btn btn-dark mt-3"
                        onClick={agregarProducto}
                    >

                        Agregar al carrito

                    </button>


                    {agregado && (

                        <div className="alert alert-success mt-3">

                            Producto agregado al carrito.

                        </div>

                    )}

                </div>

            </div>

        </section>

    );

}


export default DetalleProducto;
