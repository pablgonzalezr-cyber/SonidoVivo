import { Link } from "react-router-dom";

function Inicio() {
    return (
        <section className="container py-5">
            <div className="text-center py-4">
                <span className="badge bg-warning text-dark mb-3">
                    SONIDO VIVO
                </span>

                <h2 className="display-4 fw-bold">
                    Todo para hacer música
                </h2>

                <p className="lead text-secondary">
                    Explora instrumentos, audio profesional
                    y accesorios para músicos.
                </p>

                <div className="d-flex flex-wrap justify-content-center gap-2 mt-4">
                    <Link
                        to="/productos"
                        className="btn btn-dark btn-lg"
                    >
                        Explorar catálogo
                    </Link>

                    <Link
                        to="/contacto"
                        className="btn btn-outline-dark btn-lg"
                    >
                        Contacto
                    </Link>
                </div>
            </div>
        </section>
    );
}

export default Inicio;