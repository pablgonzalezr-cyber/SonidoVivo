const IMAGEN_POR_CODIGO = {
    GA001: "/imagenes/productos/GA001.jpg",
    GE001: "/imagenes/productos/GE001.jpg",
    BA001: "/imagenes/productos/BA001.webp",
    BT001: "/imagenes/productos/BT001.jpg",
    TC001: "/imagenes/productos/TC001.jpg",
    MI001: "/imagenes/productos/MI001.webp"
};


const IMAGEN_RESPALDO = "/imagenes/productos/sin-foto.svg";

function obtenerImagenProducto(producto) {
    const personalizada = String(producto?.imagen || "").trim();

    if (personalizada) {
        return personalizada;
    }

    return IMAGEN_POR_CODIGO[producto?.codigo] || IMAGEN_RESPALDO;
}

function usarImagenRespaldo(evento) {
    const imagen = evento.currentTarget;

    if (!imagen.src.endsWith("/sin-foto.svg")) {
        imagen.src = IMAGEN_RESPALDO;
    }
}

export {
    obtenerImagenProducto,
    usarImagenRespaldo
};
