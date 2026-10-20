import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import GestionProductos from "../pages/GestionProductos";
import { obtenerProductos } from "../services/productosService";

const productoInicial = {
    codigo: "GA001",
    nombre: "Guitarra Prueba",
    categoria: "Guitarras",
    marca: "Yamaha",
    modelo: "F310",
    precio: 129990,
    stock: 4,
    descripcion: "Guitarra de prueba"
};

const productoNuevo = {
    codigo: "te001",
    nombre: "Teclado Prueba",
    categoria: "Teclados",
    marca: "Casio",
    modelo: "CT-S200",
    precio: 89990,
    stock: 3,
    descripcion: "Teclado para principiantes"
};

beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(
        "sonidoVivoProductos",
        JSON.stringify([productoInicial])
    );
});

afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
});

function mostrarGestion() {
    render(<GestionProductos />);
}

function completarFormulario(cambios = {}) {
    const datos = { ...productoNuevo, ...cambios };

    const campos = {
        Codigo: datos.codigo,
        Nombre: datos.nombre,
        Categoría: datos.categoria,
        Marca: datos.marca,
        Modelo: datos.modelo,
        Precio: String(datos.precio),
        Stock: String(datos.stock),
        Descripcion: datos.descripcion
    };

    Object.entries(campos).forEach(([etiqueta, valor]) => {
        fireEvent.change(screen.getByLabelText(etiqueta), {
            target: { value: valor }
        });
    });
}

function enviarFormulario(nombreBoton = "Agregar producto") {
    const boton = screen.getByRole("button", {
        name: nombreBoton
    });

    fireEvent.submit(boton.closest("form"));
}

describe("Gestion de productos", () => {
    it("muestra los productos existentes", () => {
        mostrarGestion();

        expect(
            screen.getByRole("heading", {
                name: "Gestion de Productos"
            })
        ).toBeInTheDocument();

        expect(
            screen.getByText("Guitarra Prueba")
        ).toBeInTheDocument();

        expect(
            screen.getByText("GA001")
        ).toBeInTheDocument();
    });

    it("rechaza formularios con campos obligatorios vacios", () => {
        mostrarGestion();
        enviarFormulario();

        expect(
            screen.getByText(/completa todos los campos obligatorios/i)
        ).toBeInTheDocument();

        expect(obtenerProductos()).toHaveLength(1);
    });

    it("rechaza precios y stock invalidos", () => {
        mostrarGestion();

        completarFormulario({ precio: 0 });
        enviarFormulario();

        expect(
            screen.getByText(/el precio debe ser un entero positivo/i)
        ).toBeInTheDocument();

        fireEvent.change(screen.getByLabelText("Precio"), {
            target: { value: "89990" }
        });

        fireEvent.change(screen.getByLabelText("Stock"), {
            target: { value: "-2" }
        });

        enviarFormulario();

        expect(
            screen.getByText(/stock un entero igual o mayor que cero/i)
        ).toBeInTheDocument();

        expect(obtenerProductos()).toHaveLength(1);
    });

    it("agrega correctamente un producto nuevo", () => {
        mostrarGestion();
        completarFormulario();
        enviarFormulario();

        expect(
            screen.getByText("Producto agregado correctamente.")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Teclado Prueba")
        ).toBeInTheDocument();

        const productos = obtenerProductos();
        const agregado = productos.find(
            (producto) => producto.codigo === "TE001"
        );

        expect(productos).toHaveLength(2);
        expect(agregado).toMatchObject({
            nombre: "Teclado Prueba",
            precio: 89990,
            stock: 3
        });
    });

    it("impide agregar un codigo de producto duplicado", () => {
        mostrarGestion();

        completarFormulario({ codigo: "GA001" });
        enviarFormulario();

        expect(
            screen.getByText(/ya existe un producto con ese codigo/i)
        ).toBeInTheDocument();

        expect(obtenerProductos()).toHaveLength(1);
    });

    it("permite editar un producto existente", () => {
        mostrarGestion();

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

        expect(
            screen.getByText("Producto actualizado correctamente.")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Guitarra Editada")
        ).toBeInTheDocument();

        expect(obtenerProductos()[0]).toMatchObject({
            codigo: "GA001",
            nombre: "Guitarra Editada",
            precio: 159990
        });
    });

    it("permite cancelar la edicion de un producto", () => {
        mostrarGestion();

        fireEvent.click(
            screen.getByRole("button", { name: "Editar" })
        );

        fireEvent.click(
            screen.getByRole("button", { name: "Cancelar" })
        );

        expect(
            screen.getByRole("button", { name: "Agregar producto" })
        ).toBeInTheDocument();

        expect(
            screen.getByLabelText("Codigo")
        ).not.toBeDisabled();

        expect(
            screen.getByLabelText("Nombre")
        ).toHaveValue("");

        expect(obtenerProductos()[0].nombre).toBe(
            "Guitarra Prueba"
        );
    });

    it("conserva el producto si se cancela su eliminacion", () => {
        const confirmar = vi.spyOn(
            window,
            "confirm"
        ).mockReturnValue(false);

        mostrarGestion();

        fireEvent.click(
            screen.getByRole("button", { name: "Eliminar" })
        );

        expect(confirmar).toHaveBeenCalledOnce();

        expect(obtenerProductos()).toHaveLength(1);

        expect(
            screen.getByText("Guitarra Prueba")
        ).toBeInTheDocument();
    });

    it("elimina un producto cuando se confirma la accion", () => {
        const confirmar = vi.spyOn(
            window,
            "confirm"
        ).mockReturnValue(true);

        mostrarGestion();

        fireEvent.click(
            screen.getByRole("button", { name: "Eliminar" })
        );

        expect(confirmar).toHaveBeenCalledOnce();

        expect(
            screen.getByText("Producto eliminado correctamente.")
        ).toBeInTheDocument();

        expect(
            screen.queryByText("Guitarra Prueba")
        ).not.toBeInTheDocument();

        expect(obtenerProductos()).toHaveLength(0);
    });
});
