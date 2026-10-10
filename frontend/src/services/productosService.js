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


function descontarStock(productosComprados) {

    const productos = obtenerProductos();

    const cantidades = {};

    for (const item of productosComprados) {

        if (
            !Number.isInteger(item.cantidad) ||
            item.cantidad <= 0
        ) {
            throw new Error(
                "La cantidad solicitada no es válida."
            );
        }

        cantidades[item.codigo] =
            (cantidades[item.codigo] || 0) +
            item.cantidad;

    }

    for (const codigo of Object.keys(cantidades)) {

        const producto = productos.find(
            (item) => item.codigo === codigo
        );

        if (!producto) {
            throw new Error(
                "Uno de los productos ya no está disponible."
            );
        }

        if (cantidades[codigo] > producto.stock) {
            throw new Error(
                `Stock insuficiente para ${producto.nombre}. Disponibles: ${producto.stock}.`
            );
        }

    }

    const productosActualizados = productos.map(
        (producto) => ({
            ...producto,
            stock:
                producto.stock -
                (cantidades[producto.codigo] || 0)
        })
    );

    guardarProductos(productosActualizados);

    return productosActualizados;

}




export {
    inicializarProductos,
    obtenerProductos,
    obtenerProductoPorCodigo,
    agregarProducto,
    actualizarProducto,
    eliminarProducto,
    descontarStock
};
