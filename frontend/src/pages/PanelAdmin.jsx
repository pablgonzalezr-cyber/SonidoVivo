import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { listarUsuariosApi } from "../services/usuariosApi";
import { listarProductosApi } from "../services/productosApi";

function PanelAdmin() {
    const [usuarios, setUsuarios] = useState([]);
    const [productos, setProductos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let activo = true;

        Promise.all([
            listarUsuariosApi(),
            listarProductosApi()
        ])
            .then(([listaUsuarios, listaProductos]) => {
                if (activo) {
                    setUsuarios(listaUsuarios);
                    setProductos(listaProductos);
                }
            })
            .catch((error) => {
                if (activo) {
                    setError(error.message);
                }
            })
            .finally(() => {
                if (activo) {
                    setCargando(false);
                }
            });

        return () => {
            activo = false;
        };
    }, []);

    const totalStock = productos.reduce(
        (total, producto) =>
            total + Number(producto.stock || 0),
        0
    );

    const totalClientes = usuarios.filter(
        (usuario) => usuario.rol === "CLIENTE"
    ).length;

    return (
        <section className="container py-5">
            <div className="mb-4">
                <span className="badge bg-warning text-dark mb-2">
                    ADMINISTRACIÓN
                </span>

                <h2 className="fw-bold">
                    Panel de Administración
                </h2>

                <p className="text-secondary">
                    Resumen general de Sonido Vivo.
                </p>
            </div>

            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            {cargando ? (
                <p role="status">
                    Cargando datos desde MariaDB...
                </p>
            ) : (
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
            )}

            <div className="card p-4 mt-4">
                <h3 className="h5">
                    Gestión administrativa
                </h3>

                <p className="text-secondary mb-0">
                    Los indicadores de usuarios y productos se
                    obtienen desde la API de Spring Boot.
                    Los pedidos y reportes ya se consultan desde MariaDB.
                    El panel de vendedor incluye historial y alertas de inventario.
                </p>
            </div>

            <div className="d-flex flex-wrap gap-2 mt-4">
                <Link
                    to="/admin/productos"
                    className="btn btn-dark"
                >
                    Gestionar productos
                </Link>

                <Link to="/vendedor" className="btn btn-outline-dark">
                    Inventario y movimientos
                </Link>

                <Link
                    to="/admin/pedidos"
                    className="btn btn-outline-dark"
                >
                    Gestionar pedidos
                </Link>

                <Link
                    to="/admin/usuarios"
                    className="btn btn-outline-dark"
                >
                    Gestionar usuarios
                </Link>

                <Link
                    to="/admin/reportes"
                    className="btn btn-outline-dark"
                >
                    Reportes de ventas
                </Link>
            </div>
        </section>
    );
}

export default PanelAdmin;
