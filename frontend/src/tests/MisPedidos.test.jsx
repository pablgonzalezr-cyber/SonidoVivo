
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { MemoryRouter } from "react-router-dom";
import MisPedidos from "../pages/MisPedidos";
import { obtenerMisPedidosApi } from "../services/pedidosApi";

vi.mock("../services/pedidosApi", () => ({
    obtenerMisPedidosApi: vi.fn()
}));

const sesion = {
    id: 20,
    nombre: "Cliente Prueba",
    rol: "CLIENTE"
};

const pedido = {
    id: 31,
    usuarioId: 20,
    cliente: "Cliente Prueba",
    estado: "PENDIENTE",
    fechaISO: "2026-11-19T18:00:00Z",
    tipoEntrega: "RETIRO",
    direccion: "Retiro en tienda",
    total: 129990,
    productos: [{
        codigo: "GA001",
        nombre: "Guitarra de prueba",
        cantidad: 1,
        precio: 129990,
        subtotal: 129990
    }]
};

function mostrarMisPedidos() {
    render(
        <MemoryRouter>
            <MisPedidos sesion={sesion} />
        </MemoryRouter>
    );
}

beforeEach(() => {
    vi.resetAllMocks();

    vi.mocked(obtenerMisPedidosApi).mockResolvedValue([
        pedido
    ]);
});

describe("Historial de pedidos desde Spring Boot", () => {
    it("muestra pedidos del cliente real", async () => {
        mostrarMisPedidos();

        expect(
            await screen.findByText("Pedido #31")
        ).toBeInTheDocument();

        expect(
            screen.getByText(/Guitarra de prueba x/)
        ).toBeInTheDocument();

        expect(
            screen.getAllByText(/129\.990/).length
        ).toBeGreaterThan(0);

        expect(obtenerMisPedidosApi).toHaveBeenCalledTimes(1);
    });

    it("muestra mensaje cuando no hay pedidos", async () => {
        vi.mocked(obtenerMisPedidosApi).mockResolvedValue([]);

        mostrarMisPedidos();

        expect(
            await screen.findByText(
                /todavía no tienes pedidos registrados/i
            )
        ).toBeInTheDocument();
    });

    it("informa errores de consulta", async () => {
        vi.mocked(obtenerMisPedidosApi).mockRejectedValue(
            new Error("No se pudo consultar el historial")
        );

        mostrarMisPedidos();

        expect(
            await screen.findByRole("alert")
        ).toHaveTextContent(
            "No se pudo consultar el historial"
        );
    });
});
