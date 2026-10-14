
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
    crearPedido,
    obtenerPedidos
} from "../services/pedidosService";

const cliente = {
    id: 200,
    nombre: "Cliente Prueba",
    correo: "cliente@sonidovivo.cl",
    rol: "CLIENTE"
};

beforeEach(() => {
    localStorage.clear();
});

describe("Pedidos y tipos de entrega", () => {

    it("permite comprar con retiro en tienda", () => {

        const producto = obtenerProductoPorCodigo("GE001");

        const pedido = crearPedido({
            usuario: cliente,
            productos: [{ ...producto, cantidad: 1 }],
            tipoEntrega: "RETIRO"
        });

        expect(pedido.tipoEntrega).toBe("RETIRO");
        expect(pedido.direccion).toBe("Retiro en tienda");
        expect(obtenerPedidos()).toHaveLength(1);

    });

    it("permite comprar con despacho a domicilio", () => {

        const producto = obtenerProductoPorCodigo("GE001");

        const pedido = crearPedido({
            usuario: cliente,
            productos: [{ ...producto, cantidad: 1 }],
            tipoEntrega: "DESPACHO",
            direccion: "Avenida Libertad 1234"
        });

        expect(pedido.tipoEntrega).toBe("DESPACHO");
        expect(pedido.direccion).toBe(
            "Avenida Libertad 1234"
        );

    });

    it("rechaza despachos sin dirección válida", () => {

        const producto = obtenerProductoPorCodigo("GE001");

        expect(() => {

            crearPedido({
                usuario: cliente,
                productos: [{ ...producto, cantidad: 1 }],
                tipoEntrega: "DESPACHO",
                direccion: ""
            });

        }).toThrow(/direcci[oó]n/i);

        expect(obtenerPedidos()).toHaveLength(0);

    });

    it("rechaza pedidos con precios desactualizados", () => {

        const producto = obtenerProductoPorCodigo("GE001");

        expect(() => {

            crearPedido({
                usuario: cliente,
                productos: [{
                    ...producto,
                    precio: producto.precio + 1000,
                    cantidad: 1
                }],
                tipoEntrega: "RETIRO"
            });

        }).toThrow(/precio/i);

        expect(obtenerPedidos()).toHaveLength(0);

        expect(
            obtenerProductoPorCodigo("GE001").stock
        ).toBe(producto.stock);

    });

    it("impide que un vendedor realice compras", () => {

        const producto = obtenerProductoPorCodigo("GE001");

        expect(() => {

            crearPedido({
                usuario: {
                    ...cliente,
                    rol: "VENDEDOR"
                },
                productos: [{ ...producto, cantidad: 1 }],
                tipoEntrega: "RETIRO"
            });

        }).toThrow(/cliente/i);

    });

});
