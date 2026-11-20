import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    vi
} from "vitest";

import {
    fireEvent,
    render,
    screen,
    waitFor
} from "@testing-library/react";

import "@testing-library/jest-dom/vitest";

import GestionProductos from "../pages/GestionProductos";

import {
    listarProductosApi,
    crearProductoApi,
    actualizarProductoApi,
    eliminarProductoApi
} from "../services/productosApi";

vi.mock("../services/productosApi", () => ({
    listarProductosApi: vi.fn(),
    crearProductoApi: vi.fn(),
    actualizarProductoApi: vi.fn(),
    eliminarProductoApi: vi.fn()
}));

const productoInicial = {
    codigo: "GA001",
    nombre: "Guitarra Prueba",
    categoria: "Guitarras",
    marca: "Yamaha",
    modelo: "F310",
    precio: 129990,
    stock: 4,
    descripcion: "Guitarra de prueba",
    imagen: ""
};

const productoNuevo = {
    codigo: "te001",
    nombre: "Teclado Prueba",
    categoria: "Teclados",
    marca: "Casio",
    modelo: "CT-S200",
    precio: 89990,
    stock: 3,
    descripcion: "Teclado para principiantes",
    imagen: ""
};

beforeEach(() => {
    vi.resetAllMocks();

    vi.mocked(listarProductosApi).mockResolvedValue([
        productoInicial
    ]);

    vi.mocked(crearProductoApi).mockImplementation(
        async (datos) => datos
    );

    vi.mocked(actualizarProductoApi).mockImplementation(
        async (codigo, datos) => datos
    );

    vi.mocked(eliminarProductoApi).mockResolvedValue(null);
});

afterEach(() => {
    vi.restoreAllMocks();
});

async function mostrarGestion() {
    render(<GestionProductos />);

    await screen.findByText("Guitarra Prueba");
}

function completarFormulario(cambios = {}) {
    const datos = { ...productoNuevo, ...cambios };

    const campos = {
        Codigo: datos.codigo,
        Nombre: datos.nombre,
        "Categoría": datos.categoria,
        Marca: datos.marca,
        Modelo: datos.modelo,
        Precio: String(datos.precio),
        Stock: String(datos.stock),
        Descripcion: datos.descripcion
    };

    for (const [etiqueta, valor] of Object.entries(campos)) {
        fireEvent.change(screen.getByLabelText(etiqueta), {
            target: { value: valor }
        });
    }
}

function enviarFormulario(nombreBoton = "Agregar producto") {
    fireEvent.submit(
        screen.getByRole("button", {
            name: nombreBoton
        }).closest("form")
    );
}

describe("Gestion administrativa de productos", () => {
    it("muestra los productos recibidos de MariaDB", async () => {
        await mostrarGestion();

        expect(
            screen.getByText("GA001")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Guitarra Prueba")
        ).toBeInTheDocument();

        expect(listarProductosApi).toHaveBeenCalled();
    });

    it("rechaza campos obligatorios vacios", async () => {
        await mostrarGestion();

        enviarFormulario();

        expect(
            screen.getByText(/completa los campos obligatorios/i)
        ).toBeInTheDocument();

        expect(crearProductoApi).not.toHaveBeenCalled();
    });

    it("rechaza precios invalidos", async () => {
        await mostrarGestion();

        completarFormulario({ precio: 0 });
        enviarFormulario();

        expect(
            screen.getByText(/precio debe ser un entero positivo/i)
        ).toBeInTheDocument();

        expect(crearProductoApi).not.toHaveBeenCalled();
    });

    it("crea productos mediante la API", async () => {
        await mostrarGestion();

        completarFormulario();
        enviarFormulario();

        await waitFor(() => {
            expect(crearProductoApi).toHaveBeenCalledWith(
                expect.objectContaining({
                    codigo: "TE001",
                    nombre: "Teclado Prueba",
                    precio: 89990,
                    stock: 3
                })
            );
        });

        expect(
            await screen.findByText("Producto agregado correctamente.")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Teclado Prueba")
        ).toBeInTheDocument();
    });

    it("edita productos mediante la API", async () => {
        await mostrarGestion();

        fireEvent.click(
            screen.getByRole("button", { name: "Editar" })
        );

        expect(
            screen.getByLabelText("Codigo")
        ).toBeDisabled();

        fireEvent.change(screen.getByLabelText("Nombre"), {
            target: { value: "Guitarra Editada" }
        });

        fireEvent.change(screen.getByLabelText("Precio"), {
            target: { value: "159990" }
        });

        enviarFormulario("Guardar cambios");

        await waitFor(() => {
            expect(actualizarProductoApi).toHaveBeenCalledWith(
                "GA001",
                expect.objectContaining({
                    nombre: "Guitarra Editada",
                    precio: 159990
                })
            );
        });

        expect(
            await screen.findByText("Guitarra Editada")
        ).toBeInTheDocument();
    });

    it("permite cancelar la edicion", async () => {
        await mostrarGestion();

        fireEvent.click(
            screen.getByRole("button", { name: "Editar" })
        );

        fireEvent.click(
            screen.getByRole("button", { name: "Cancelar" })
        );

        expect(
            screen.getByRole("button", {
                name: "Agregar producto"
            })
        ).toBeInTheDocument();

        expect(
            screen.getByLabelText("Codigo")
        ).not.toBeDisabled();

        expect(actualizarProductoApi).not.toHaveBeenCalled();
    });

    it("muestra errores enviados por la API", async () => {
        vi.mocked(crearProductoApi).mockRejectedValue(
            new Error("Ya existe un producto con ese código.")
        );

        await mostrarGestion();

        completarFormulario({ codigo: "GA001" });
        enviarFormulario();

        expect(
            await screen.findByText(/ya existe un producto/i)
        ).toBeInTheDocument();
    });

    it("elimina un producto con confirmacion", async () => {
        vi.spyOn(window, "confirm").mockReturnValue(true);

        await mostrarGestion();

        fireEvent.click(
            screen.getByRole("button", { name: "Eliminar" })
        );

        await waitFor(() => {
            expect(eliminarProductoApi).toHaveBeenCalledWith(
                "GA001"
            );
        });

        expect(
            await screen.findByText("Producto eliminado correctamente.")
        ).toBeInTheDocument();

        expect(
            screen.queryByText("Guitarra Prueba")
        ).not.toBeInTheDocument();
    });
});
