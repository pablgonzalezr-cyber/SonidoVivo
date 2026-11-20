
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import GestionPedidos from "../pages/GestionPedidos";

import {
    listarPedidosApi,
    cambiarEstadoPedidoApi
} from "../services/pedidosApi";

vi.mock("../services/pedidosApi", () => ({
    listarPedidosApi: vi.fn(),
    cambiarEstadoPedidoApi: vi.fn()
}));

const pedido = {
    id: 31,
    usuarioId: 20,
    cliente: "Cliente Prueba",
    correo: "cliente@sonidovivo.cl",
    fechaISO: "2026-11-19T18:00:00Z",
    tipoEntrega: "RETIRO",
    direccion: "Retiro en tienda",
    estado: "PENDIENTE",
    total: 129990,
    productos: [{
        codigo: "GA001",
        nombre: "Guitarra de prueba",
        cantidad: 1,
        precio: 129990,
        subtotal: 129990
    }]
};

beforeEach(() => {
    vi.resetAllMocks();

    vi.mocked(listarPedidosApi).mockResolvedValue([pedido]);

    vi.mocked(cambiarEstadoPedidoApi).mockResolvedValue({
        ...pedido,
        estado: "EN_PREPARACION"
    });
});

describe("Gestion administrativa de pedidos", () => {
    it("muestra los pedidos recuperados de la API", async () => {
        render(<GestionPedidos />);

        expect(
            await screen.findByText("#31")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Cliente Prueba")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Guitarra de prueba x 1")
        ).toBeInTheDocument();

        expect(listarPedidosApi).toHaveBeenCalledTimes(1);
    });

    it("solo ofrece estados validos segun el flujo", async () => {
        render(<GestionPedidos />);

        const selector = await screen.findByLabelText(
            "Estado del pedido 31"
        );

        expect(selector).toHaveValue("PENDIENTE");

        expect(
            screen.getByRole("option", {
                name: "En preparación"
            })
        ).toBeInTheDocument();

        expect(
            screen.queryByRole("option", {
                name: "Entregado"
            })
        ).not.toBeInTheDocument();
    });

    it("actualiza el estado de un pedido mediante la API", async () => {
        render(<GestionPedidos />);

        const selector = await screen.findByLabelText(
            "Estado del pedido 31"
        );

        fireEvent.change(selector, {
            target: { value: "EN_PREPARACION" }
        });

        await waitFor(() => {
            expect(cambiarEstadoPedidoApi).toHaveBeenCalledWith(
                31,
                "EN_PREPARACION"
            );
        });

        expect(
            await screen.findByText(/actualizado a En preparación/i)
        ).toBeInTheDocument();
    });

    it("muestra un mensaje cuando no hay pedidos", async () => {
        vi.mocked(listarPedidosApi).mockResolvedValue([]);

        render(<GestionPedidos />);

        expect(
            await screen.findByText(/no existen pedidos registrados/i)
        ).toBeInTheDocument();
    });

    it("muestra un error cuando la API falla", async () => {
        vi.mocked(listarPedidosApi).mockRejectedValue(
            new Error("Servidor no disponible")
        );

        render(<GestionPedidos />);

        expect(
            await screen.findByRole("alert")
        ).toHaveTextContent("Servidor no disponible");
    });
});
