
import { useState } from "react";
import { Link } from "react-router-dom";

import {
    obtenerCarrito,
    vaciarCarrito
} from "../services/carritoService";

import { crearPedido } from "../services/pedidosService";

function Checkout({ sesion }) {

    const [carrito, setCarrito] = useState(obtenerCarrito());
    const [direccion, setDireccion] = useState("");
    const [tipoEntrega, setTipoEntrega] = useState("DESPACHO");
    const [error, setError] = useState("");
    const [pedidoCreado, setPedidoCreado] = useState(null);

    const total = carrito.reduce(
        (acumulador, producto) =>
            acumulador + producto.precio * producto.cantidad,
        0
    );

    function confirmarPedido(evento) {

        evento.preventDefault();
        setError("");

        if (carrito.length === 0) {
            setError("No hay productos en el carrito.");
            return;
        }

        if (
            tipoEntrega === "DESPACHO" &&
            direccion.trim().length < 5
        ) {
            setError("Ingresa una direccion valida.");
            return;
        }

        try {

            const pedido = crearPedido({
                usuario: sesion,
                productos: carrito,
                direccion: direccion,
                tipoEntrega: tipoEntrega
            });

            vaciarCarrito();
            setCarrito([]);
            setDireccion("");
            setPedidoCreado(pedido);

        } catch (error) {

            setError(
                error.message || "No se pudo confirmar el pedido."
            );

        }
    }

    if (pedidoCreado) {

        return (
            <section className="container py-5">

                <div className="alert alert-success">

                    <h2 className="h4">
                        Pedido confirmado
                    </h2>

                    <p>
                        Número de pedido: {pedidoCreado.id}
                    </p>

                    <p>
                        Tipo de entrega:{" "}
                        {pedidoCreado.tipoEntrega === "RETIRO"
                            ? "Retiro en tienda"
                            : "Despacho a domicilio"}
                    </p>

                    <p>
                        {pedidoCreado.tipoEntrega === "RETIRO"
                            ? "Tu pedido será preparado para retiro."
                            : `Dirección: ${pedidoCreado.direccion}`}
                    </p>

                    <p className="mb-0">
                        Total: $
                        {pedidoCreado.total.toLocaleString("es-CL")}
                    </p>

                </div>

                <div className="d-flex gap-2 flex-wrap">

                    <Link
                        to="/mis-pedidos"
                        className="btn btn-dark"
                    >
                        Ver mis pedidos
                    </Link>

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

    return (
        <section className="container py-5">

            <h2 className="fw-bold">
                Finalizar compra
            </h2>

            <p className="text-secondary">
                Revisa tus productos y selecciona el tipo de entrega.
            </p>

            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            <div className="row g-4">

                <div className="col-12 col-lg-7">

                    <div className="card p-4">

                        <h3 className="h5 mb-3">
                            Productos
                        </h3>

                        {carrito.length === 0 ? (

                            <p>Tu carrito está vacío.</p>

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
                                        Cantidad: {producto.cantidad}
                                    </p>

                                </div>

                            ))

                        )}

                        <h3 className="h5 mt-4">
                            Total: ${total.toLocaleString("es-CL")}
                        </h3>

                    </div>

                </div>

                <div className="col-12 col-lg-5">

                    <form
                        className="card p-4"
                        onSubmit={confirmarPedido}
                    >

                        <h3 className="h5 mb-3">
                            Datos de entrega
                        </h3>

                        <p className="text-secondary">
                            Cliente: {sesion.nombre}
                        </p>

                        <fieldset className="mb-4">

                            <legend className="form-label fw-bold fs-6">
                                Método de entrega
                            </legend>

                            <div className="form-check mb-2">

                                <input
                                    className="form-check-input"
                                    type="radio"
                                    id="tipoDespacho"
                                    name="tipoEntrega"
                                    value="DESPACHO"
                                    checked={tipoEntrega === "DESPACHO"}
                                    onChange={(evento) =>
                                        setTipoEntrega(evento.target.value)
                                    }
                                />

                                <label
                                    className="form-check-label"
                                    htmlFor="tipoDespacho"
                                >
                                    Despacho a domicilio
                                </label>

                            </div>

                            <div className="form-check">

                                <input
                                    className="form-check-input"
                                    type="radio"
                                    id="tipoRetiro"
                                    name="tipoEntrega"
                                    value="RETIRO"
                                    checked={tipoEntrega === "RETIRO"}
                                    onChange={(evento) =>
                                        setTipoEntrega(evento.target.value)
                                    }
                                />

                                <label
                                    className="form-check-label"
                                    htmlFor="tipoRetiro"
                                >
                                    Retiro en tienda
                                </label>

                            </div>

                        </fieldset>

                        {tipoEntrega === "DESPACHO" ? (

                            <div className="mb-3">

                                <label
                                    htmlFor="direccion"
                                    className="form-label"
                                >
                                    Dirección de despacho
                                </label>

                                <input
                                    id="direccion"
                                    type="text"
                                    className="form-control"
                                    value={direccion}
                                    onChange={(evento) =>
                                        setDireccion(evento.target.value)
                                    }
                                    required
                                    minLength={5}
                                    placeholder="Ej: Avenida Libertad 1234"
                                />

                            </div>

                        ) : (

                            <div
                                className="alert alert-info"
                                role="status"
                            >
                                Podrás retirar tu pedido en Sonido Vivo
                                una vez que esté listo.

                                <Link to="/ubicaciones" className="d-inline-block mt-2">
                                    Ver zonas referenciales en el mapa
                                </Link>
                            </div>

                        )}

                        <button
                            type="submit"
                            className="btn btn-dark"
                            disabled={carrito.length === 0}
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
