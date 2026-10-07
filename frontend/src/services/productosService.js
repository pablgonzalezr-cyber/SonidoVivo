import productosIniciales from "../data/productos";


const CLAVE_PRODUCTOS = "sonidoVivoProductos";


function guardarProductos(productos) {

    localStorage.setItem(
        CLAVE_PRODUCTOS,
        JSON.stringify(productos)
    );

}


function inicializarProductos() {

    const datos =
        localStorage.getItem(CLAVE_PRODUCTOS);


    if (datos) {

        return;

    }


    guardarProductos(productosIniciales);

}


function obtenerProductos() {

    inicializarProductos();


    const datos =
        localStorage.getItem(CLAVE_PRODUCTOS);


    return JSON.parse(datos);

}


function obtenerProductoPorCodigo(codigo) {

    const productos = obtenerProductos();


    return productos.find(
        (producto) =>
            producto.codigo === codigo
    );

}


function agregarProducto(producto) {

    const productos = obtenerProductos();


    const existeCodigo =
        productos.some(
            (item) =>
                item.codigo === producto.codigo
        );


    if (existeCodigo) {

        return false;

    }


    productos.push(producto);

    guardarProductos(productos);


    return true;

}


function actualizarProducto(productoActualizado) {

    const productos = obtenerProductos();


    const nuevosProductos =
        productos.map(
            (producto) => {

                if (
                    producto.codigo ===
                    productoActualizado.codigo
                ) {

                    return productoActualizado;

                }


                return producto;

            }
        );


    guardarProductos(nuevosProductos);

}


function eliminarProducto(codigo) {

    const productos = obtenerProductos();


    const nuevosProductos =
        productos.filter(
            (producto) =>
                producto.codigo !== codigo
        );


    guardarProductos(nuevosProductos);

}


export {
    inicializarProductos,
    obtenerProductos,
    obtenerProductoPorCodigo,
    agregarProducto,
    actualizarProducto,
    eliminarProducto
};
