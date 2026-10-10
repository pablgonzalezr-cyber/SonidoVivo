import {
    obtenerProductos
} from "../services/productosService";

import {
    obtenerUsuarios
} from "../services/usuariosService";

import { Link } from "react-router-dom";


function PanelAdmin() {

    const usuarios = obtenerUsuarios();

    const productos = obtenerProductos();

    const totalStock =
        productos.reduce(
            (total, producto) =>
                total + producto.stock,
            0
        );


    const totalClientes =
        usuarios.filter(
            (usuario) =>
                usuario.rol === "CLIENTE"
        ).length;


    return (

        <section className="container py-5">

            <div className="mb-4">

                <span className="badge bg-warning text-dark mb-2">

                    ADMINISTRACION

                </span>


                <h2 className="fw-bold">

                    Panel de Administracion

                </h2>


                <p className="text-secondary">

                    Resumen general de Sonido Vivo.

                </p>

            </div>


            <div className="row g-4">

                <div className="col-12 col-md-4">

                    <div className="card h-100 p-4">

                        <h3 className="h6 text-secondary">

                            Productos cargados

                        </h3>


                        <p className="display-5 fw-bold mb-0">

                            {productos.length}

                        </p>

                    </div>

                </div>


                <div className="col-12 col-md-4">

                    <div className="card h-100 p-4">

                        <h3 className="h6 text-secondary">

                            Stock registrado

                        </h3>


                        <p className="display-5 fw-bold mb-0">

                            {totalStock}

                        </p>

                    </div>

                </div>


                <div className="col-12 col-md-4">

                    <div className="card h-100 p-4">

                        <h3 className="h6 text-secondary">

                            Clientes registrados

                        </h3>


                        <p className="display-5 fw-bold mb-0">

                            {totalClientes}

                        </p>

                    </div>

                </div>

            </div>


            <div className="card p-4 mt-4">

                <h3 className="h5">

                    Gestion administrativa

                </h3>


                <p className="text-secondary mb-0">

                    Desde este panel puedes administrar los productos
                    del catálogo y consultar o actualizar los pedidos.
                    La información se almacena localmente como simulación
                    de esta etapa del proyecto.


                </p>

            </div>

            <div className="mt-4">

                <Link
                    to="/admin/productos"
                    className="btn btn-dark"
                >

                    Gestionar productos

                </Link>

                <Link
                    to="/admin/pedidos"
                    className="btn btn-outline-dark ms-2"
                >

                    Gestionar pedidos

                </Link>

            </div>

        </section>

    );

}


export default PanelAdmin;