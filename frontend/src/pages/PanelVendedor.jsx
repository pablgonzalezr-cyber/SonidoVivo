
import { useState } from "react";
import { Link } from "react-router-dom";

import {
    obtenerProductos,
    actualizarStock
} from "../services/productosService";

function PanelVendedor() {

    const [productos, setProductos] = useState(obtenerProductos());
    const [stocks, setStocks] = useState({});
    const [mensaje, setMensaje] = useState("");
    const [error, setError] = useState("");

    function cambiarStock(codigo, valor) {
        setStocks({
            ...stocks,
            [codigo]: valor
        });
    }

    function guardarStock(codigo) {

        setMensaje("");
        setError("");

        const producto = productos.find(
            (item) => item.codigo === codigo
        );

        const valor = stocks[codigo] ?? String(producto.stock);

        if (
            valor.trim() === "" ||
            !Number.isSafeInteger(Number(valor)) ||
            Number(valor) < 0
        ) {
            setError("Ingresa un stock valido.");
            return;
        }

        try {

            actualizarStock(codigo, Number(valor));

            setProductos(obtenerProductos());

            setStocks((anteriores) => {
                const nuevos = { ...anteriores };
                delete nuevos[codigo];
                return nuevos;
            });

            setMensaje("Stock actualizado correctamente.");

        } catch (error) {

            setError(error.message);

        }
    }

    return (
        <section className="container py-5">

            <h2 className="fw-bold">
                Panel de Vendedor
            </h2>

            <p className="text-secondary">
                Consulta productos, actualiza existencias y gestiona pedidos.
            </p>

            <Link
                to="/admin/pedidos"
                className="btn btn-dark mb-4"
            >
                Gestionar pedidos
            </Link>

            {mensaje && (
                <div className="alert alert-success" role="status">
                    {mensaje}
                </div>
            )}

            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            <div className="table-responsive">
                <table className="table table-striped align-middle">

                    <thead>
                        <tr>
                            <th>Codigo</th>
                            <th>Producto</th>
                            <th>Stock actual</th>
                            <th>Nuevo stock</th>
                            <th>Accion</th>
                        </tr>
                    </thead>

                    <tbody>
                        {productos.map((producto) => (
                            <tr key={producto.codigo}>

                                <td>{producto.codigo}</td>

                                <td>{producto.nombre}</td>

                                <td>{producto.stock}</td>

                                <td>
                                    <input
                                        type="number"
                                        min="0"
                                        step="1"
                                        className="form-control"
                                        aria-label={`Nuevo stock de ${producto.nombre}`}
                                        value={
                                            stocks[producto.codigo] ??
                                            String(producto.stock)
                                        }
                                        onChange={(evento) =>
                                            cambiarStock(
                                                producto.codigo,
                                                evento.target.value
                                            )
                                        }
                                    />
                                </td>

                                <td>
                                    <button
                                        type="button"
                                        className="btn btn-dark btn-sm"
                                        onClick={() =>
                                            guardarStock(producto.codigo)
                                        }
                                    >
                                        Guardar
                                    </button>
                                </td>

                            </tr>
                        ))}
                    </tbody>

                </table>
            </div>

        </section>
    );
}

export default PanelVendedor;
