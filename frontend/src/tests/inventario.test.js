
import { beforeEach, describe, expect, it } from "vitest";

import {
    agregarAlCarrito,
    obtenerCarrito,
    sincronizarCarritoConProductos
} from "../services/carritoService";

const producto = {
    codigo: "GA001",
    nombre: "Guitarra de prueba",
    categoria: "Guitarras",
    marca: "Yamaha",
    modelo: "F310",
    precio: 129990,
    stock: 3
};

beforeEach(() => {
    localStorage.clear();
});

describe("Inventario del carrito frente al catalogo del backend", () => {
    it("no permite agregar mas unidades que el stock informado", () => {
        agregarAlCarrito({
            ...producto,
            stock: 1
        });

        expect(() => {
            agregarAlCarrito({
                ...producto,
                stock: 1
            });
        }).toThrow(/stock/i);

        expect(obtenerCarrito()[0].cantidad).toBe(1);
    });

    it("detecta cuando el backend informa menos unidades", () => {
        agregarAlCarrito(producto);
        agregarAlCarrito(producto);

        const resultado = sincronizarCarritoConProductos([
            {
                ...producto,
                stock: 1
            }
        ]);

        expect(resultado.puedeContinuar).toBe(false);
        expect(resultado.carrito[0].cantidad).toBe(2);

        expect(
            resultado.advertencias.join(" ")
        ).toMatch(/stock insuficiente/i);
    });

    it("actualiza los precios a los del backend", () => {
        agregarAlCarrito(producto);

        const resultado = sincronizarCarritoConProductos([
            {
                ...producto,
                precio: 149990
            }
        ]);

        expect(resultado.carrito[0].precio).toBe(149990);

        expect(
            resultado.advertencias.join(" ")
        ).toMatch(/precio/i);
    });

    it("retira del carrito productos eliminados", () => {
        agregarAlCarrito(producto);

        const resultado = sincronizarCarritoConProductos([]);

        expect(resultado.carrito).toEqual([]);
        expect(obtenerCarrito()).toEqual([]);
        expect(resultado.advertencias).toHaveLength(1);
    });
});
