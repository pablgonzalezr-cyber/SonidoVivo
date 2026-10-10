import {
    beforeEach,
    describe,
    it,
    expect
} from "vitest";

import {
    obtenerProductoPorCodigo
} from "../services/productosService";

import {
    agregarAlCarrito,
    obtenerCarrito
} from "../services/carritoService";

import {
    crearPedido,
    obtenerPedidos
} from "../services/pedidosService";

const usuario = {
    id: 100,
    nombre: "Cliente Prueba",
    correo: "cliente@sonidovivo.cl",
    rol: "CLIENTE"
};

beforeEach(() => {
    localStorage.clear();
});

describe("Carrito y control de inventario", () => {

    it("permite agregar productos dentro del stock", () => {

        const producto = obtenerProductoPorCodigo("GE001");

        agregarAlCarrito(producto);
        agregarAlCarrito(producto);

        const carrito = obtenerCarrito();

        expect(carrito).toHaveLength(1);
        expect(carrito[0].cantidad).toBe(2);

    });

    it("rechaza cantidades superiores al stock", () => {

        const producto = obtenerProductoPorCodigo("GE001");

        for (let i = 0; i < producto.stock; i++) {
            agregarAlCarrito(producto);
        }

        expect(() => {
            agregarAlCarrito(producto);
        }).toThrow(/stock/i);

        expect(obtenerCarrito()[0].cantidad).toBe(
            producto.stock
        );

    });

    it("descuenta inventario al confirmar un pedido", () => {

        const producto = obtenerProductoPorCodigo("GE001");

        const pedido = crearPedido({
            usuario,
            productos: [
                {
                    ...producto,
                    cantidad: 2
                }
            ],
            direccion: "Avenida Libertad 1234"
        });

        const productoActualizado =
            obtenerProductoPorCodigo("GE001");

        expect(productoActualizado.stock).toBe(
            producto.stock - 2
        );

        expect(pedido.estado).toBe("PENDIENTE");
        expect(obtenerPedidos()).toHaveLength(1);

    });

    it("rechaza compras sin stock suficiente", () => {

        const producto = obtenerProductoPorCodigo("GE001");

        expect(() => {

            crearPedido({
                usuario,
                productos: [
                    {
                        ...producto,
                        cantidad: producto.stock + 1
                    }
                ],
                direccion: "Avenida Libertad 1234"
            });

        }).toThrow(/stock insuficiente/i);

        expect(obtenerPedidos()).toHaveLength(0);

        expect(
            obtenerProductoPorCodigo("GE001").stock
        ).toBe(producto.stock);

    });

});
