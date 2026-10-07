function ProductoCard({ producto }) {

    return (

        <article className="card h-100 producto-card">

            <div className="producto-imagen-placeholder">

                ♫

            </div>


            <div className="card-body d-flex flex-column">

                <span className="badge bg-secondary align-self-start mb-2">

                    {producto.categoria}

                </span>


                <h3 className="h5 card-title">

                    {producto.nombre}

                </h3>


                <p className="text-secondary mb-1">

                    {producto.marca} · {producto.modelo}

                </p>


                <p className="card-text">

                    {producto.descripcion}

                </p>


                <div className="mt-auto">

                    <p className="fw-bold fs-5 mb-1">

                        ${producto.precio.toLocaleString("es-CL")}

                    </p>


                    <small className="text-secondary">

                        Stock disponible: {producto.stock}

                    </small>

                </div>

            </div>

        </article>

    );

}


export default ProductoCard;