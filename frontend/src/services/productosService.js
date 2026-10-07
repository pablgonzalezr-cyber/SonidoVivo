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


export {
    inicializarProductos,
    obtenerProductos,
    obtenerProductoPorCodigo
};
