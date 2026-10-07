import { useState } from "react";
import { Link } from "react-router-dom";

import {
    obtenerCarrito,
    eliminarDelCarrito
} from "../services/carritoService";


function Carrito() {

    const [carrito, setCarrito] =
        useState(obtenerCarrito());


    function eliminarProducto(codigo) {

        const nuevoCarrito =
            eliminarDelCarrito(codigo);


        setCarrito(nuevoCarrito);

    }


    const total = carrito.reduce(
        (acumulador, producto) => {

            return (
                acumulador +
                producto.precio *
                producto.cantidad
            );

        },
        0
    );


    return (

        <section className="container py-5">

            <h2 className="fw-bold mb-4">

                Carrito de compras

            </h2>


            {carrito.length === 0 ? (

                <div className="alert alert-secondary">

                    <p>
                        Tu carrito esta vacio.
                    </p>


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

                                    <div className="row align-items-center">

                                        <div className="col-md-6">

                                            <h3 className="h5">

                                                {producto.nombre}

                                            </h3>


                                            <p className="mb-1 text-secondary">

                                                {producto.marca}
                                                {" · "}
                                                {producto.modelo}

                                            </p>

                                        </div>


                                        <div className="col-md-2">

                                            Cantidad:
                                            {" "}
                                            {producto.cantidad}

                                        </div>


                                        <div className="col-md-2 fw-bold">

                                            $
                                            {(
                                                producto.precio *
                                                producto.cantidad
                                            ).toLocaleString("es-CL")}

                                        </div>


                                        <div className="col-md-2">

                                            <button
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

                            Total:
                            {" "}
                            $
                            {total.toLocaleString("es-CL")}

                        </h3>

                    </div>

                </>

            )}

        </section>

    );

}


export default Carrito;
