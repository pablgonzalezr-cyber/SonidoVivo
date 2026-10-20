
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { MemoryRouter } from "react-router-dom";
import Carrito from "../pages/Carrito";
import { obtenerCarrito, eliminarDelCarrito } from "../services/carritoService";

vi.mock("../services/carritoService", () => ({
    obtenerCarrito: vi.fn(),
    eliminarDelCarrito: vi.fn()
}));

const guitarra = {
    codigo: "GA001",
    nombre: "Guitarra de prueba",
    marca: "Yamaha",
    modelo: "F310",
    precio: 120000,
    cantidad: 2
};

const bateria = {
    codigo: "BT001",
    nombre: "Bateria de prueba",
    marca: "Roland",
    modelo: "RX",
    precio: 10000,
    cantidad: 1
};

beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(obtenerCarrito).mockReturnValue([]);
});

function mostrarCarrito() {
    render(
        <MemoryRouter>
            <Carrito />
        </MemoryRouter>
    );
}

describe("Pagina del carrito", () => {
    it("muestra el estado vacio y el enlace al catalogo", () => {
        mostrarCarrito();
        expect(screen.getByText(/carrito esta vacio/i)).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Ver productos" }))
            .toHaveAttribute("href", "/productos");
    });

    it("lista productos y calcula el total", () => {
        vi.mocked(obtenerCarrito).mockReturnValue([guitarra, bateria]);
        mostrarCarrito();
        expect(screen.getByText("Guitarra de prueba")).toBeInTheDocument();
        expect(screen.getByText("Bateria de prueba")).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: /Total:.*250\.000/i }))
            .toBeInTheDocument();
    });

    it("elimina el unico producto y muestra el carrito vacio", () => {
        vi.mocked(obtenerCarrito).mockReturnValue([guitarra]);
        vi.mocked(eliminarDelCarrito).mockReturnValue([]);
        mostrarCarrito();
        fireEvent.click(screen.getByRole("button", { name: "Eliminar" }));
        expect(eliminarDelCarrito).toHaveBeenCalledWith("GA001");
        expect(screen.getByText(/carrito esta vacio/i)).toBeInTheDocument();
    });

    it("actualiza el total al eliminar un producto", () => {
        vi.mocked(obtenerCarrito).mockReturnValue([guitarra, bateria]);
        vi.mocked(eliminarDelCarrito).mockReturnValue([bateria]);
        mostrarCarrito();
        fireEvent.click(screen.getAllByRole("button", { name: "Eliminar" })[0]);
        expect(eliminarDelCarrito).toHaveBeenCalledWith("GA001");
        expect(screen.queryByText("Guitarra de prueba")).not.toBeInTheDocument();
        expect(screen.getByRole("heading", { name: /Total:.*10\.000/i }))
            .toBeInTheDocument();
    });
});
