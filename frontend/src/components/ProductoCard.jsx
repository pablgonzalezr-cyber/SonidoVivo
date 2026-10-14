import { Link } from "react-router-dom";
import {
    obtenerImagenProducto,
    usarImagenRespaldo
} from "../utils/imagenesProductos";


function ProductoCard({ producto }) {

    return (

        <article className="card h-100 producto-card">

            <img
                src={obtenerImagenProducto(producto)}
                alt={`Imagen del producto ${producto.nombre}`}
                className="sv-foto-producto card-img-top"
                loading="lazy"
                onError={usarImagenRespaldo}
            />


            <div className="card-body d-flex flex-column">

                <span className="badge bg-secondary align-self-start mb-2">

                    {producto.categoria}

                </span>


                <h3 className="h5 card-title">

                    {producto.nombre}

                </h3>


                <p className="text-secondary mb-1">

                    {producto.marca}
                    {" · "}
                    {producto.modelo}

                </p>


                <p className="card-text">

                    {producto.descripcion}

                </p>


                <div className="mt-auto">

                    <p className="fw-bold fs-5 mb-1">

                        $
                        {producto.precio.toLocaleString("es-CL")}

                    </p>


                    <small className="text-secondary">

                        Stock disponible:
                        {" "}
                        {producto.stock}

                    </small>


                    <Link
                        to={`/productos/${producto.codigo}`}
                        className="btn btn-outline-dark w-100 mt-3"
                    >

                        Ver detalle

                    </Link>

                </div>

            </div>

        </article>

    );

}


export default ProductoCard;