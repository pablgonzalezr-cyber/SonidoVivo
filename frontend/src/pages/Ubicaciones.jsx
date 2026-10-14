import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import puntosRetiro from "../data/ubicaciones";

function Ubicaciones() {
    const contenedorRef = useRef(null);
    const mapaRef = useRef(null);

    useEffect(() => {
        if (!contenedorRef.current || mapaRef.current) {
            return;
        }

        const mapa = L.map(contenedorRef.current, {
            scrollWheelZoom: false
        });

        mapaRef.current = mapa;

        L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
                attribution: "&copy; OpenStreetMap contributors",
                maxZoom: 19
            }
        ).addTo(mapa);

        const marcadorIcono = L.divIcon({
            className: "sv-mapa-icono",
            html: "♫",
            iconSize: [38, 38],
            iconAnchor: [19, 19]
        });

        const posiciones = [];

        puntosRetiro.forEach((punto) => {
            const posicion = [punto.lat, punto.lng];
            posiciones.push(posicion);

            L.marker(posicion, { icon: marcadorIcono })
                .addTo(mapa)
                .bindPopup(punto.nombre);
        });

        if (posiciones.length > 1) {
            mapa.fitBounds(posiciones, { padding: [35, 35] });
        } else if (posiciones.length === 1) {
            mapa.setView(posiciones[0], 14);
        } else {
            mapa.setView([-33.0249, -71.5518], 12);
        }

        return () => {
            mapa.remove();
            mapaRef.current = null;
        };
    }, []);

    return (
        <section className="container py-5">
            <h2 className="fw-bold">Ubicaciones y retiro</h2>
            <p className="text-secondary">
                Consulta el mapa interactivo y los puntos de referencia.
            </p>

            <div className="alert alert-warning" role="note">
                Ubicaciones de demostración para el proyecto académico.
                No representan direcciones comerciales ni puntos de retiro
                confirmados de Sonido Vivo.
            </div>

            <div
                ref={contenedorRef}
                className="sv-mapa mb-4"
                role="region"
                aria-label="Mapa de zonas referenciales en Viña del Mar"
            />

            <div className="row g-3">
                {puntosRetiro.map((punto) => (
                    <div className="col-12 col-md-6" key={punto.id}>
                        <article className="card h-100 p-3">
                            <h3 className="h5">{punto.nombre}</h3>
                            <p className="text-secondary">
                                {punto.descripcion}
                            </p>
                            <p className="small mb-3">
                                Coordenadas referenciales: {punto.lat}, {punto.lng}
                            </p>
                            <a
                                className="btn btn-outline-dark mt-auto"
                                target="_blank"
                                rel="noopener noreferrer"
                                href={`https://www.google.com/maps/dir/?api=1&destination=${punto.lat},${punto.lng}`}
                            >
                                Ver referencia en mapas
                            </a>
                        </article>
                    </div>
                ))}
            </div>

            <Link to="/checkout" className="btn btn-dark mt-4">
                Volver al proceso de compra
            </Link>
        </section>
    );
}

export default Ubicaciones;