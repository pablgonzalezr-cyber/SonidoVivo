import {
    obtenerProductoPorCodigo
} from "./productosService";

const CLAVE_CARRITO = "sonidoVivoCarrito";


function obtenerCarrito() {

    const datos =
        localStorage.getItem(CLAVE_CARRITO);


    if (!datos) {

        return [];

    }


    return JSON.parse(datos);

}


function guardarCarrito(carrito) {

    localStorage.setItem(
        CLAVE_CARRITO,
        JSON.stringify(carrito)
    );

}



function agregarAlCarrito(producto) {

    
    const productoActual = obtenerProductoPorCodigo(
        producto.codigo
    );

    
    if (!productoActual) {
        throw new Error(
            "El producto ya no está disponible."
        );
    }

    const carrito = obtenerCarrito();

    
    const productoExistente = carrito.find(
        (item) => item.codigo === producto.codigo
    );

    
    const cantidadActual = productoExistente
        ? productoExistente.cantidad
        : 0;

    
    if (cantidadActual >= productoActual.stock) {
        throw new Error(
            "No hay suficiente stock disponible."
        );
    }

   
    if (productoExistente) {
        productoExistente.cantidad =
            productoExistente.cantidad + 1;
    } else {
        carrito.push({
            ...productoActual,
            cantidad: 1
        });
    }

    
    guardarCarrito(carrito);
}



function eliminarDelCarrito(codigo) {

    const carrito = obtenerCarrito();


    const nuevoCarrito =
        carrito.filter(
            (item) =>
                item.codigo !== codigo
        );


    guardarCarrito(nuevoCarrito);


    return nuevoCarrito;

}

function vaciarCarrito() {

    localStorage.removeItem(
        CLAVE_CARRITO
    );

}


export {
    obtenerCarrito,
    agregarAlCarrito,
    eliminarDelCarrito,
    vaciarCarrito
};
