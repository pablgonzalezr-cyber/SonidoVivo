import { useState } from "react";
import { Link } from "react-router-dom";

import {
    obtenerCarrito,
    vaciarCarrito
} from "../services/carritoService";

import {
    crearPedido
} from "../services/pedidosService";


function Checkout({
    sesion
}) {

    const [carrito, setCarrito] =
        useState(obtenerCarrito());


    const [direccion, setDireccion] =
        useState("");


    const [error, setError] =
        useState("");


    const [pedidoCreado, setPedidoCreado] =
        useState(null);


    const total =
        carrito.reduce(
            (acumulador, producto) =>
                acumulador +
                producto.precio *
                producto.cantidad,
            0
        );


    function confirmarPedido(evento) {

        evento.preventDefault();

        setError("");


        if (direccion.trim().length < 5) {

            setError(
                "Ingresa una direccion valida."
            );

            return;

        }


        if (carrito.length === 0) {

            setError(
                "No hay productos en el carrito."
            );

            return;

        }


        const pedido =
            crearPedido({

                usuario: sesion,

                productos: carrito,

                direccion: direccion

            });


        vaciarCarrito();


        setCarrito([]);

        setDireccion("");

        setPedidoCreado(pedido);

    }


    if (pedidoCreado) {

        return (

            <section className="container py-5">

                <div className="alert alert-success">

                    <h2 className="h4">

                        Pedido confirmado

                    </h2>


                    <p>

                        Numero de pedido:
                        {" "}
                        {pedidoCreado.id}

                    </p>


                    <p className="mb-0">

                        Total:
                        {" "}
                        $
                        {pedidoCreado.total
                            .toLocaleString("es-CL")}

                    </p>

                </div>


                <Link
                    to="/productos"
                    className="btn btn-dark"
                >

                    Volver al catalogo

                </Link>

            </section>

        );

    }


    return (

        <section className="container py-5">

            <h2 className="fw-bold">

                Finalizar compra

            </h2>


            <p className="text-secondary">

                Revisa tu pedido antes de confirmar.

            </p>


            {error && (

                <div className="alert alert-danger">

                    {error}

                </div>

            )}


            <div className="row g-4">

                <div className="col-12 col-lg-7">

                    <div className="card p-4">

                        <h3 className="h5">

                            Productos

                        </h3>


                        {carrito.length === 0 ? (

                            <p>

                                Tu carrito esta vacio.

                            </p>

                        ) : (

                            carrito.map((producto) => (

                                <div
                                    key={producto.codigo}
                                    className="border-bottom py-3"
                                >

                                    <strong>

                                        {producto.nombre}

                                    </strong>


                                    <p className="mb-0">

                                        Cantidad:
                                        {" "}
                                        {producto.cantidad}

                                    </p>

                                </div>

                            ))

                        )}


                        <h3 className="h5 mt-4">

                            Total:
                            {" "}
                            $
                            {total.toLocaleString("es-CL")}

                        </h3>

                    </div>

                </div>


                <div className="col-12 col-lg-5">

                    <form
                        className="card p-4"
                        onSubmit={confirmarPedido}
                    >

                        <h3 className="h5">

                            Datos de entrega

                        </h3>


                        <p className="text-secondary">

                            Cliente:
                            {" "}
                            {sesion.nombre}

                        </p>


                        <div className="mb-3">

                            <label
                                htmlFor="direccion"
                                className="form-label"
                            >

                                Direccion

                            </label>


                            <input
                                id="direccion"
                                type="text"
                                className="form-control"
                                value={direccion}
                                onChange={(evento) =>
                                    setDireccion(
                                        evento.target.value
                                    )
                                }
                            />

                        </div>


                        <button
                            type="submit"
                            className="btn btn-dark"
                            disabled={
                                carrito.length === 0
                            }
                        >

                            Confirmar pedido

                        </button>

                    </form>

                </div>

            </div>

        </section>

    );

}


export default Checkout;