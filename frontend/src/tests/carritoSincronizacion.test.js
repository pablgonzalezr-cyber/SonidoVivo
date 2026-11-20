
import {
    beforeEach,
    describe,
    expect,
    it
} from "vitest";

import {
    agregarAlCarrito,
    obtenerCarrito,
    migrarCarritoInvitado,
    sincronizarCarritoConProductos
} from "../services/carritoService";

const producto = {
    codigo: "GA001",
    nombre: "Guitarra de prueba",
    categoria: "Guitarras",
    marca: "Yamaha",
    modelo: "F310",
    precio: 120000,
    stock: 5
};

beforeEach(() => {
    localStorage.clear();
});

describe("Sincronizacion del carrito con MariaDB", () => {
    it("agrega productos respetando el stock", () => {
        agregarAlCarrito({
            ...producto,
            stock: 2
        });

        agregarAlCarrito({
            ...producto,
            stock: 2
        });

        expect(obtenerCarrito()[0].cantidad).toBe(2);

        expect(() =>
            agregarAlCarrito({
                ...producto,
                stock: 2
            })
        ).toThrow(/stock/i);
    });

    it("actualiza los precios al sincronizar", () => {
        localStorage.setItem(
            "sonidoVivoCarrito",
            JSON.stringify([{
                ...producto,
                precio: 100000,
                cantidad: 2
            }])
        );

        const resultado = sincronizarCarritoConProductos([
            producto
        ]);

        expect(resultado.carrito[0].precio).toBe(120000);
        expect(resultado.puedeContinuar).toBe(true);
        expect(resultado.advertencias).toHaveLength(1);

        expect(obtenerCarrito()[0].precio).toBe(120000);
    });

    it("bloquea continuar si el stock es insuficiente", () => {
        localStorage.setItem(
            "sonidoVivoCarrito",
            JSON.stringify([{
                ...producto,
                cantidad: 3
            }])
        );

        const resultado = sincronizarCarritoConProductos([
            {
                ...producto,
                stock: 1
            }
        ]);

        expect(resultado.puedeContinuar).toBe(false);
        expect(resultado.carrito[0].cantidad).toBe(3);

        expect(
            resultado.advertencias.join(" ")
        ).toMatch(/stock insuficiente/i);
    });

    it("retira productos eliminados del catalogo", () => {
        localStorage.setItem(
            "sonidoVivoCarrito",
            JSON.stringify([{
                ...producto,
                cantidad: 1
            }])
        );

        const resultado = sincronizarCarritoConProductos([]);

        expect(resultado.carrito).toHaveLength(0);
        expect(resultado.advertencias).toHaveLength(1);
        expect(obtenerCarrito()).toHaveLength(0);
    });

    it("traspasa el carrito invitado a un cliente", () => {
        localStorage.setItem(
            "sonidoVivoCarrito",
            JSON.stringify([{
                ...producto,
                cantidad: 2
            }])
        );

        migrarCarritoInvitado(10);

        const carritoCliente = JSON.parse(
            localStorage.getItem(
                "sonidoVivoCarrito:usuario:10"
            )
        );

        expect(carritoCliente).toHaveLength(1);
        expect(carritoCliente[0].cantidad).toBe(2);

        expect(
            localStorage.getItem("sonidoVivoCarrito")
        ).toBeNull();
    });
});
