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

    const carrito = obtenerCarrito();


    const productoExistente =
        carrito.find(
            (item) =>
                item.codigo === producto.codigo
        );


    if (productoExistente) {

        productoExistente.cantidad =
            productoExistente.cantidad + 1;

    } else {

        carrito.push({

            ...producto,

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


export {
    obtenerCarrito,
    agregarAlCarrito,
    eliminarDelCarrito
};
