
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { MemoryRouter } from "react-router-dom";

import Carrito from "../pages/Carrito";
import { listarProductosApi } from "../services/productosApi";
import {
    obtenerCarrito,
    eliminarDelCarrito,
    sincronizarCarritoConProductos
} from "../services/carritoService";

vi.mock("../services/productosApi", () => ({
    listarProductosApi: vi.fn()
}));

vi.mock("../services/carritoService", () => ({
    obtenerCarrito: vi.fn(),
    eliminarDelCarrito: vi.fn(),
    sincronizarCarritoConProductos: vi.fn()
}));

const guitarra = {
    codigo: "GA001",
    nombre: "Guitarra de prueba",
    marca: "Yamaha",
    modelo: "F310",
    precio: 120000,
    stock: 5,
    cantidad: 2
};

const bateria = {
    codigo: "BT001",
    nombre: "Bateria de prueba",
    marca: "Roland",
    modelo: "RX",
    precio: 10000,
    stock: 3,
    cantidad: 1
};

let carritoActual;

beforeEach(() => {
    vi.resetAllMocks();
    carritoActual = [];

    vi.mocked(obtenerCarrito).mockImplementation(
        () => carritoActual
    );

    vi.mocked(eliminarDelCarrito).mockImplementation((codigo) => {
        carritoActual = carritoActual.filter(
            (item) => item.codigo !== codigo
        );
        return carritoActual;
    });

    vi.mocked(sincronizarCarritoConProductos).mockImplementation(
        () => ({
            carrito: carritoActual,
            advertencias: [],
            puedeContinuar: true
        })
    );

    vi.mocked(listarProductosApi).mockResolvedValue([
        guitarra,
        bateria
    ]);
});

function mostrarCarrito() {
    render(
        <MemoryRouter>
            <Carrito />
        </MemoryRouter>
    );
}

describe("Carrito conectado al catalogo real", () => {
    it("muestra el carrito vacio", async () => {
        mostrarCarrito();

        expect(
            await screen.findByText(/tu carrito está vacío/i)
        ).toBeInTheDocument();

        expect(
            screen.getByRole("link", { name: "Ver productos" })
        ).toHaveAttribute("href", "/productos");
    });

    it("sincroniza productos y calcula el total", async () => {
        carritoActual = [guitarra, bateria];

        mostrarCarrito();

        expect(
            await screen.findByText("Guitarra de prueba")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Bateria de prueba")
        ).toBeInTheDocument();

        expect(
            screen.getByRole("heading", {
                name: /total:.*250\.000/i
            })
        ).toBeInTheDocument();

        expect(listarProductosApi).toHaveBeenCalled();
        expect(sincronizarCarritoConProductos).toHaveBeenCalled();
    });

    it("elimina productos del carrito", async () => {
        carritoActual = [guitarra];

        mostrarCarrito();

        await screen.findByText("Guitarra de prueba");

        fireEvent.click(
            screen.getByRole("button", { name: "Eliminar" })
        );

        expect(eliminarDelCarrito).toHaveBeenCalledWith("GA001");

        expect(
            await screen.findByText(/tu carrito está vacío/i)
        ).toBeInTheDocument();
    });

    it("muestra el precio actualizado por el servidor", async () => {
        carritoActual = [guitarra];

        vi.mocked(sincronizarCarritoConProductos).mockReturnValue({
            carrito: [{ ...guitarra, precio: 130000 }],
            advertencias: [
                "El precio de Guitarra de prueba cambió."
            ],
            puedeContinuar: true
        });

        mostrarCarrito();

        expect(
            await screen.findByText(/el precio de guitarra de prueba cambió/i)
        ).toBeInTheDocument();

        expect(
            screen.getByRole("heading", {
                name: /total:.*260\.000/i
            })
        ).toBeInTheDocument();
    });

    it("bloquea continuar cuando no alcanza el stock", async () => {
        carritoActual = [guitarra];

        vi.mocked(sincronizarCarritoConProductos).mockReturnValue({
            carrito: [guitarra],
            advertencias: ["Stock insuficiente"],
            puedeContinuar: false
        });

        mostrarCarrito();

        expect(
            await screen.findByText("Stock insuficiente")
        ).toBeInTheDocument();

        expect(
            screen.getByRole("button", {
                name: /revisar stock antes de continuar/i
            })
        ).toBeDisabled();

        expect(
            screen.queryByRole("link", {
                name: "Finalizar compra"
            })
        ).not.toBeInTheDocument();
    });

    it("muestra un error cuando Spring Boot no responde", async () => {
        carritoActual = [guitarra];

        vi.mocked(listarProductosApi).mockRejectedValue(
            new Error("No se pudo conectar con el servidor.")
        );

        mostrarCarrito();

        expect(
            await screen.findByRole("alert")
        ).toHaveTextContent(
            "No se pudo conectar con el servidor."
        );

        expect(
            screen.queryByRole("link", {
                name: "Finalizar compra"
            })
        ).not.toBeInTheDocument();
    });
});
