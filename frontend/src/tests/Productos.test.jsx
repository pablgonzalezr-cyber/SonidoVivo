import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { MemoryRouter } from "react-router-dom";
import Productos from "../pages/Productos";
import { listarProductosApi, listarCategoriasApi } from "../services/productosApi";

vi.mock("../services/productosApi", () => ({
    listarProductosApi: vi.fn(),
    listarCategoriasApi: vi.fn()
}));

const datos = [
    { codigo: "GA001", nombre: "Guitarra Prueba", categoria: "Guitarras", marca: "Yamaha", modelo: "F310", precio: 129990, stock: 5, descripcion: "" },
    { codigo: "BA001", nombre: "Bajo Prueba", categoria: "Bajos", marca: "Squier", modelo: "Affinity", precio: 229990, stock: 0, descripcion: "" },
    { codigo: "MI001", nombre: "Microfono Prueba", categoria: "Microfonos", marca: "Shure", modelo: "SM58", precio: 149990, stock: 8, descripcion: "" }
];

beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(listarCategoriasApi).mockResolvedValue(["Bajos", "Guitarras", "Microfonos"]);
    vi.mocked(listarProductosApi).mockImplementation(async ({ filtros = {} } = {}) => {
        let resultado = [...datos];
        if (filtros.texto?.trim()) {
            const buscar = filtros.texto.toLowerCase();
            resultado = resultado.filter((producto) =>
                [producto.nombre, producto.marca, producto.modelo]
                    .some((campo) => campo.toLowerCase().includes(buscar)));
        }
        if (filtros.categoria && filtros.categoria !== "Todas") {
            resultado = resultado.filter((p) => p.categoria === filtros.categoria);
        }
        if (filtros.precioMin !== "") {
            resultado = resultado.filter((p) => p.precio >= Number(filtros.precioMin));
        }
        if (filtros.precioMax !== "") {
            resultado = resultado.filter((p) => p.precio <= Number(filtros.precioMax));
        }
        if (filtros.disponible) resultado = resultado.filter((p) => p.stock > 0);
        if (filtros.orden === "precio_desc") resultado.sort((a, b) => b.precio - a.precio);
        return resultado;
    });
});

function mostrar() {
    render(<MemoryRouter><Productos /></MemoryRouter>);
}

describe("Catalogo con filtros REST en MariaDB", () => {
    it("carga el catalogo y las categorias de la API", async () => {
        mostrar();
        expect(await screen.findByRole("heading", { name: "Guitarra Prueba" })).toBeInTheDocument();
        expect(listarProductosApi).toHaveBeenCalled();
        expect(listarCategoriasApi).toHaveBeenCalledTimes(1);
    });

    it("busca por modelo en el backend", async () => {
        mostrar();
        await screen.findByRole("heading", { name: "Guitarra Prueba" });
        fireEvent.change(screen.getByLabelText("Buscar producto"), {
            target: { value: "SM58" }
        });
        expect(await screen.findByRole("heading", { name: "Microfono Prueba" })).toBeInTheDocument();
        await waitFor(() => expect(screen.queryByRole("heading", { name: "Guitarra Prueba" })).not.toBeInTheDocument());
        expect(listarProductosApi).toHaveBeenCalledWith(expect.objectContaining({
            filtros: expect.objectContaining({ texto: "SM58" })
        }));
    });

    it("filtra por categoria desde la API", async () => {
        mostrar();
        await screen.findByRole("option", { name: "Guitarras" });
        fireEvent.change(screen.getByLabelText("Categoria"), {
            target: { value: "Bajos" }
        });
        expect(await screen.findByRole("heading", { name: "Bajo Prueba" })).toBeInTheDocument();
        expect(listarProductosApi).toHaveBeenCalledWith(expect.objectContaining({
            filtros: expect.objectContaining({ categoria: "Bajos" })
        }));
    });

    it("filtra por precio y disponibilidad", async () => {
        mostrar();
        await screen.findByRole("heading", { name: "Guitarra Prueba" });
        fireEvent.change(screen.getByLabelText("Precio máximo"), {
            target: { value: "150000" }
        });
        fireEvent.click(screen.getByLabelText("Con stock"));
        await waitFor(() => expect(screen.queryByRole("heading", { name: "Bajo Prueba" })).not.toBeInTheDocument());
        expect(listarProductosApi).toHaveBeenCalledWith(expect.objectContaining({
            filtros: expect.objectContaining({ disponible: true, precioMax: "150000" })
        }));
    });

    it("rechaza un rango de precios invertido sin consultar la API", async () => {
        mostrar();
        await screen.findByRole("heading", { name: "Guitarra Prueba" });
        fireEvent.change(screen.getByLabelText("Precio mínimo"), { target: { value: "300000" } });
        fireEvent.change(screen.getByLabelText("Precio máximo"), { target: { value: "10000" } });
        expect(await screen.findByRole("alert")).toHaveTextContent(/mínimo no puede ser mayor/i);
    });

    it("muestra errores del servidor y permite reintentar", async () => {
        vi.mocked(listarProductosApi).mockRejectedValueOnce(new Error("Sin conexión"))
            .mockResolvedValueOnce(datos);
        mostrar();
        expect(await screen.findByRole("alert")).toHaveTextContent("Sin conexión");
        fireEvent.click(screen.getByRole("button", { name: "Reintentar" }));
        expect(await screen.findByRole("heading", { name: "Guitarra Prueba" })).toBeInTheDocument();
    });
});
