import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { MemoryRouter } from "react-router-dom";
import PanelVendedor from "../pages/PanelVendedor";
import { listarProductosApi, actualizarStockApi } from "../services/productosApi";
import { obtenerResumenInventarioApi, listarMovimientosStockApi } from "../services/inventarioApi";

vi.mock("../services/productosApi", () => ({
    listarProductosApi: vi.fn(), actualizarStockApi: vi.fn()
}));
vi.mock("../services/inventarioApi", () => ({
    obtenerResumenInventarioApi: vi.fn(), listarMovimientosStockApi: vi.fn()
}));

const producto = {
    codigo: "GA001", nombre: "Guitarra Prueba", categoria: "Guitarras",
    marca: "Yamaha", modelo: "F310", precio: 129990, stock: 3
};
const resumen = {
    totalProductos: 1, unidadesTotales: 3, agotados: 0,
    stockBajo: 1, umbral: 5, alertas: [producto]
};
const movimiento = {
    id: 5, codigoProducto: "GA001", tipo: "AJUSTE", stockAntes: 5,
    stockDespues: 3, variacion: -2, usuarioId: 9, pedidoId: null,
    fecha: "2026-11-19T18:00:00Z"
};

beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(listarProductosApi).mockResolvedValue([producto]);
    vi.mocked(actualizarStockApi).mockResolvedValue({ ...producto, stock: 6 });
    vi.mocked(obtenerResumenInventarioApi).mockResolvedValue(resumen);
    vi.mocked(listarMovimientosStockApi).mockResolvedValue([movimiento]);
});

function mostrar() {
    render(<MemoryRouter><PanelVendedor /></MemoryRouter>);
}

describe("Panel avanzado de vendedor", () => {
    it("muestra alertas e historial desde la API", async () => {
        mostrar();
        expect((await screen.findAllByText("Guitarra Prueba")).length).toBeGreaterThan(0);
        expect(screen.getAllByText("Stock bajo").length).toBeGreaterThan(0);
        expect(screen.getByText("AJUSTE")).toBeInTheDocument();
        expect(listarMovimientosStockApi).toHaveBeenCalledTimes(1);
    });

    it("guarda stock y vuelve a consultar datos", async () => {
        mostrar();
        await screen.findAllByText("Guitarra Prueba");
        fireEvent.change(screen.getByLabelText("Nuevo stock de Guitarra Prueba"), {
            target: { value: "6" }
        });
        fireEvent.click(screen.getByRole("button", { name: "Guardar" }));
        await waitFor(() => expect(actualizarStockApi).toHaveBeenCalledWith("GA001", 6));
        await waitFor(() => expect(listarProductosApi).toHaveBeenCalledTimes(2));
    });

    it("permite cambiar umbral y filtrar historial", async () => {
        mostrar();
        await screen.findAllByText("Guitarra Prueba");
        fireEvent.change(screen.getByLabelText("Umbral de alerta"), {
            target: { value: "2" }
        });
        fireEvent.click(screen.getByRole("button", { name: "Aplicar umbral" }));
        await waitFor(() => expect(obtenerResumenInventarioApi).toHaveBeenCalledWith(2));
    });

    it("muestra fallos de permisos", async () => {
        vi.mocked(obtenerResumenInventarioApi).mockRejectedValue(
            new Error("No tienes permisos de inventario.")
        );
        mostrar();
        expect(await screen.findByRole("alert")).toHaveTextContent("permisos");
    });
});
