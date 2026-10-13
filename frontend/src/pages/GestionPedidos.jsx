
import { useState } from "react";

import {
    obtenerPedidos,
    actualizarEstadoPedido
} from "../services/pedidosService";

function GestionPedidos() {

    const [pedidos, setPedidos] = useState(obtenerPedidos());

    function cambiarEstado(pedidoId, nuevoEstado) {

        const pedidosActualizados = actualizarEstadoPedido(
            pedidoId,
            nuevoEstado
        );

        setPedidos(pedidosActualizados);
    }

    return (
        <section className="container py-5">

            <h2 className="fw-bold">
                Gestión de pedidos
            </h2>

            <p className="text-secondary">
                Revisa y actualiza los pedidos de clientes.
            </p>

            {pedidos.length === 0 ? (

                <div className="alert alert-secondary">
                    No existen pedidos registrados.
                </div>

            ) : (

                <div className="table-responsive mt-4">

                    <table className="table table-striped align-middle tabla-pedidos">

                        <thead>
                            <tr>
                                <th>Pedido</th>
                                <th>Cliente</th>
                                <th>Fecha</th>
                                <th>Entrega</th>
                                <th>Total</th>
                                <th>Estado</th>
                            </tr>
                        </thead>

                        <tbody>

                            {pedidos.map((pedido) => (

                                <tr key={pedido.id}>

                                    <td>#{pedido.id}</td>

                                    <td>
                                        {pedido.cliente}

                                        <br />

                                        <small className="text-secondary">
                                            {pedido.correo}
                                        </small>
                                    </td>

                                    <td>{pedido.fecha}</td>

                                    <td>
                                        <strong>
                                            {pedido.tipoEntrega === "RETIRO"
                                                ? "Retiro en tienda"
                                                : "Despacho"}
                                        </strong>

                                        <div className="small text-secondary">
                                            {pedido.direccion}
                                        </div>
                                    </td>

                                    <td>
                                        ${pedido.total.toLocaleString("es-CL")}
                                    </td>

                                    <td>

                                        <select
                                            className="form-select"
                                            aria-label={`Estado del pedido ${pedido.id}`}
                                            value={pedido.estado}
                                            onChange={(evento) =>
                                                cambiarEstado(
                                                    pedido.id,
                                                    evento.target.value
                                                )
                                            }
                                        >

                                            <option value="PENDIENTE">
                                                PENDIENTE
                                            </option>

                                            <option value="EN PREPARACION">
                                                EN PREPARACIÓN
                                            </option>

                                            {pedido.tipoEntrega === "RETIRO" ? (

                                                <option value="LISTO PARA RETIRO">
                                                    LISTO PARA RETIRO
                                                </option>

                                            ) : (

                                                <option value="ENVIADO">
                                                    ENVIADO
                                                </option>

                                            )}

                                            <option value="ENTREGADO">
                                                ENTREGADO
                                            </option>

                                        </select>

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

export default GestionPedidos;
