import {
    beforeEach,
    describe,
    it,
    expect,
    vi
} from "vitest";

import {
    render,
    screen,
    fireEvent
} from "@testing-library/react";

import "@testing-library/jest-dom/vitest";

import { MemoryRouter } from "react-router-dom";
import Productos from "../pages/Productos";
import { obtenerProductos } from "../services/productosService";

vi.mock("../services/productosService", () => ({
    obtenerProductos: vi.fn()
}));

const productosPrueba = [
    {
        codigo: "GA001",
        nombre: "Guitarra Prueba",
        categoria: "Guitarras Acústicas",
        marca: "Yamaha",
        modelo: "F310",
        descripcion: "Guitarra de prueba",
        precio: 129990,
        stock: 5
    },
    {
        codigo: "BA001",
        nombre: "Bajo Prueba",
        categoria: "Bajos Eléctricos",
        marca: "Squier",
        modelo: "Affinity",
        descripcion: "Bajo de prueba",
        precio: 229990,
        stock: 3
    },
    {
        codigo: "MI001",
        nombre: "Micrófono Prueba",
        categoria: "Micrófonos",
        marca: "Shure",
        modelo: "SM58",
        descripcion: "Micrófono de prueba",
        precio: 149990,
        stock: 8
    }
];

beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(obtenerProductos).mockReturnValue(productosPrueba);
});

function mostrarCatalogo() {
    render(
        <MemoryRouter>
            <Productos />
        </MemoryRouter>
    );
}

describe("Página de catálogo", () => {

    it("muestra las tarjetas de los productos simulados", () => {

        mostrarCatalogo();

        expect(
            screen.getByRole("heading", { name: "Guitarra Prueba" })
        ).toBeInTheDocument();

        expect(
            screen.getByRole("heading", { name: "Bajo Prueba" })
        ).toBeInTheDocument();

        expect(
            screen.getByRole("heading", { name: "Micrófono Prueba" })
        ).toBeInTheDocument();

    });

    it("filtra productos al escribir una marca", () => {

        mostrarCatalogo();

        fireEvent.change(
            screen.getByLabelText("Buscar producto"),
            { target: { value: "Shure" } }
        );

        expect(
            screen.getByRole("heading", { name: "Micrófono Prueba" })
        ).toBeInTheDocument();

        expect(
            screen.queryByRole("heading", { name: "Guitarra Prueba" })
        ).not.toBeInTheDocument();

    });

    it("filtra productos al seleccionar una categoría", () => {

        mostrarCatalogo();

        fireEvent.change(
            screen.getByLabelText("Categoria"),
            { target: { value: "Bajos Eléctricos" } }
        );

        expect(
            screen.getByRole("heading", { name: "Bajo Prueba" })
        ).toBeInTheDocument();

        expect(
            screen.queryByRole("heading", { name: "Micrófono Prueba" })
        ).not.toBeInTheDocument();

    });

    it("avisa cuando no hay coincidencias", () => {

        mostrarCatalogo();

        fireEvent.change(
            screen.getByLabelText("Buscar producto"),
            { target: { value: "Producto Inexistente" } }
        );

        expect(
            screen.getByText(/No encontramos productos/i)
        ).toBeInTheDocument();

    });

});
