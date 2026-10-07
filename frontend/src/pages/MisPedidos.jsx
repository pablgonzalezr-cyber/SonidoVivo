import {
    obtenerPedidosPorUsuario
} from "../services/pedidosService";


function MisPedidos({
    sesion
}) {

    const pedidos =
        obtenerPedidosPorUsuario(
            sesion.id
        );


    return (

        <section className="container py-5">

            <h2 className="fw-bold">

                Mis Pedidos

            </h2>


            <p className="text-secondary">

                Historial de compras
                realizadas en Sonido Vivo.

            </p>


            {pedidos.length === 0 ? (

                <div className="alert alert-secondary">

                    Todavia no tienes pedidos.

                </div>

            ) : (

                <div className="row g-4 mt-2">

                    {pedidos.map((pedido) => (

                        <div
                            className="col-12"
                            key={pedido.id}
                        >

                            <div className="card p-4">

                                <div className="d-flex justify-content-between flex-wrap gap-2">

                                    <div>

                                        <h3 className="h5">

                                            Pedido #{pedido.id}

                                        </h3>


                                        <p className="text-secondary mb-0">

                                            {pedido.fecha}

                                        </p>

                                    </div>


                                    <span className="badge bg-dark align-self-start">

                                        {pedido.estado}

                                    </span>

                                </div>


                                <hr />


                                {pedido.productos.map(
                                    (producto) => (

                                        <p
                                            key={producto.codigo}
                                            className="mb-1"
                                        >

                                            {producto.nombre}
                                            {" x "}
                                            {producto.cantidad}

                                        </p>

                                    )
                                )}


                                <hr />


                                <p className="fw-bold mb-0">

                                    Total:
                                    {" "}
                                    $
                                    {pedido.total
                                        .toLocaleString("es-CL")}

                                </p>

                            </div>

                        </div>

                    ))}

                </div>

            )}

        </section>

    );

}


export default MisPedidos;
