import productos from "../data/productos";

import ProductoCard from "../components/ProductoCard";


function Productos() {

    return (

        <section className="container py-5">

            <div className="mb-4">

                <h2 className="fw-bold">

                    Catálogo de productos

                </h2>


                <p className="text-secondary">

                    Conoce una muestra de los instrumentos
                    y equipos disponibles en Sonido Vivo.

                </p>

            </div>


            <div className="row g-4">

                {productos.map((producto) => (

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

        </section>

    );

}


export default Productos;