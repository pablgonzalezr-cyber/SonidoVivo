import { beforeEach, describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { MemoryRouter } from "react-router-dom";
import Productos from "../pages/Productos";
import { listarProductosApi } from "../services/productosApi";

vi.mock("../services/productosApi", () => ({
    listarProductosApi: vi.fn()
}));

const productosPrueba = [
    {
        codigo: "GA001", nombre: "Guitarra Prueba", categoria: "Guitarras Acústicas",
        marca: "Yamaha", modelo: "F310", descripcion: "Guitarra de prueba",
        precio: 129990, stock: 5
    },
    {
        codigo: "BA001", nombre: "Bajo Prueba", categoria: "Bajos Eléctricos",
        marca: "Squier", modelo: "Affinity", descripcion: "Bajo de prueba",
        precio: 229990, stock: 3
    },
    {
        codigo: "MI001", nombre: "Micrófono Prueba", categoria: "Micrófonos",
        marca: "Shure", modelo: "SM58", descripcion: "Micrófono de prueba",
        precio: 149990, stock: 8
    }
];

beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(listarProductosApi).mockResolvedValue(productosPrueba);
});

function mostrarCatalogo() {
    return render(
        <MemoryRouter>
            <Productos />
        </MemoryRouter>
    );
}

describe("Catalogo React conectado a API", () => {
    it("carga y muestra los productos entregados por la API", async () => {
        mostrarCatalogo();
        expect(await screen.findByRole("heading", { name: "Guitarra Prueba" }))
            .toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Bajo Prueba" }))
            .toBeInTheDocument();
        expect(listarProductosApi).toHaveBeenCalledOnce();
    });

    it("filtra los productos por marca", async () => {
        mostrarCatalogo();
        await screen.findByRole("heading", { name: "Guitarra Prueba" });
        fireEvent.change(screen.getByLabelText("Buscar producto"), {
            target: { value: "Shure" }
        });
        expect(screen.getByRole("heading", { name: "Micrófono Prueba" }))
            .toBeInTheDocument();
        expect(screen.queryByRole("heading", { name: "Guitarra Prueba" }))
            .not.toBeInTheDocument();
    });

    it("filtra los productos por categoria", async () => {
        mostrarCatalogo();
        await screen.findByRole("heading", { name: "Bajo Prueba" });
        fireEvent.change(screen.getByLabelText("Categoria"), {
            target: { value: "Bajos Eléctricos" }
        });
        expect(screen.getByRole("heading", { name: "Bajo Prueba" }))
            .toBeInTheDocument();
        expect(screen.queryByRole("heading", { name: "Micrófono Prueba" }))
            .not.toBeInTheDocument();
    });

    it("informa cuando la busqueda no encuentra coincidencias", async () => {
        mostrarCatalogo();
        await screen.findByRole("heading", { name: "Guitarra Prueba" });
        fireEvent.change(screen.getByLabelText("Buscar producto"), {
            target: { value: "Instrumento Inexistente" }
        });
        expect(screen.getByText(/No encontramos productos/i))
            .toBeInTheDocument();
    });

    it("muestra un estado de carga mientras espera la API", () => {
        vi.mocked(listarProductosApi).mockImplementation(
            () => new Promise(() => {})
        );
        mostrarCatalogo();
        expect(screen.getByRole("status")).toHaveTextContent(/Cargando productos/i);
    });

    it("muestra un mensaje cuando la API no responde", async () => {
        vi.mocked(listarProductosApi).mockRejectedValue(
            new Error("Servidor fuera de servicio")
        );
        mostrarCatalogo();
        expect(await screen.findByRole("alert"))
            .toHaveTextContent("Servidor fuera de servicio");
        expect(screen.getByRole("button", { name: "Reintentar" }))
            .toBeInTheDocument();
    });

    it("permite reintentar tras un error temporal", async () => {
        vi.mocked(listarProductosApi)
            .mockRejectedValueOnce(new Error("Error de red"))
            .mockResolvedValueOnce(productosPrueba);
        mostrarCatalogo();
        await screen.findByRole("alert");
        fireEvent.click(screen.getByRole("button", { name: "Reintentar" }));
        expect(await screen.findByRole("heading", { name: "Guitarra Prueba" }))
            .toBeInTheDocument();
        expect(listarProductosApi).toHaveBeenCalledTimes(2);
    });
});
