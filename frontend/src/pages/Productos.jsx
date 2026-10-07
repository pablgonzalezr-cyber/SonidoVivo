import { useState } from "react";

import {
    obtenerProductos
} from "../services/productosService";
import ProductoCard from "../components/ProductoCard";


function Productos() {

    const productos = obtenerProductos();

    const [busqueda, setBusqueda] = useState("");

    const [categoria, setCategoria] = useState("Todas");


    const productosFiltrados = productos.filter((producto) => {

        const coincideBusqueda =
            producto.nombre
                .toLowerCase()
                .includes(busqueda.toLowerCase()) ||
            producto.marca
                .toLowerCase()
                .includes(busqueda.toLowerCase());


        const coincideCategoria =
            categoria === "Todas" ||
            producto.categoria === categoria;


        return coincideBusqueda && coincideCategoria;

    });


    return (

        <section className="container py-5">

            <div className="mb-4">

                <h2 className="fw-bold">
                    Catalogo de productos
                </h2>


                <p className="text-secondary">
                    Conoce los instrumentos y equipos
                    disponibles en Sonido Vivo.
                </p>

            </div>


            <div className="row g-3 mb-4">

                <div className="col-12 col-md-7">

                    <label
                        htmlFor="buscarProducto"
                        className="form-label"
                    >
                        Buscar producto
                    </label>


                    <input
                        id="buscarProducto"
                        type="text"
                        className="form-control"
                        placeholder="Ej: Yamaha, guitarra..."
                        value={busqueda}
                        onChange={(evento) =>
                            setBusqueda(evento.target.value)
                        }
                    />

                </div>


                <div className="col-12 col-md-5">

                    <label
                        htmlFor="categoriaProducto"
                        className="form-label"
                    >
                        Categoria
                    </label>


                    <select
                        id="categoriaProducto"
                        className="form-select"
                        value={categoria}
                        onChange={(evento) =>
                            setCategoria(evento.target.value)
                        }
                    >

                        <option value="Todas">
                            Todas
                        </option>

                        <option value="Guitarras Acústicas">
                            Guitarras Acústicas
                        </option>

                        <option value="Guitarras Eléctricas">
                            Guitarras Eléctricas
                        </option>

                        <option value="Bajos Eléctricos">
                            Bajos Eléctricos
                        </option>

                        <option value="Baterías">
                            Baterías
                        </option>

                        <option value="Teclados y Pianos">
                            Teclados y Pianos
                        </option>

                        <option value="Micrófonos">
                            Micrófonos
                        </option>

                    </select>

                </div>

            </div>


            <p className="text-secondary">

                Productos encontrados:
                {" "}
                {productosFiltrados.length}

            </p>


            <div className="row g-4">

                {productosFiltrados.map((producto) => (

                    <div
                        className="col-12 col-md-6 col-lg-4"
                        key={producto.codigo}
                    >

                        <ProductoCard
                            producto={producto}
                        />

                    </div>

                ))}

            </div>


            {productosFiltrados.length === 0 && (

                <div className="alert alert-warning mt-4">

                    No encontramos productos
                    con esos criterios.

                </div>

            )}

        </section>

    );

}


export default Productos;
