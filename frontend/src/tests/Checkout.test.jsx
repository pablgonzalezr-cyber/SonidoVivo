
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { MemoryRouter } from "react-router-dom";
import Checkout from "../pages/Checkout";
import { listarProductosApi } from "../services/productosApi";
import { crearPedidoApi } from "../services/pedidosApi";
import {
    obtenerCarrito,
    vaciarCarrito,
    sincronizarCarritoConProductos
} from "../services/carritoService";

vi.mock("../services/productosApi", () => ({
    listarProductosApi: vi.fn()
}));

vi.mock("../services/pedidosApi", () => ({
    crearPedidoApi: vi.fn()
}));

vi.mock("../services/carritoService", () => ({
    obtenerCarrito: vi.fn(),
    vaciarCarrito: vi.fn(),
    sincronizarCarritoConProductos: vi.fn()
}));

const cliente = {
    id: 20,
    nombre: "Cliente Prueba",
    correo: "cliente@sonidovivo.cl",
    rol: "CLIENTE"
};

const producto = {
    codigo: "GA001",
    nombre: "Guitarra de prueba",
    marca: "Yamaha",
    modelo: "F310",
    precio: 129990,
    stock: 5,
    cantidad: 1
};

const pedidoConfirmado = {
    id: 31,
    usuarioId: 20,
    cliente: "Cliente Prueba",
    tipoEntrega: "RETIRO",
    direccion: "Retiro en tienda",
    estado: "PENDIENTE",
    total: 129990,
    productos: [{
        codigo: "GA001",
        nombre: "Guitarra de prueba",
        precio: 129990,
        cantidad: 1,
        subtotal: 129990
    }]
};

function mostrarCheckout() {
    render(
        <MemoryRouter>
            <Checkout sesion={cliente} />
        </MemoryRouter>
    );
}

async function esperarFormularioListo() {
    await waitFor(() => {
        expect(
            screen.getByRole("button", { name: "Confirmar pedido" })
        ).toBeEnabled();
    });
}

function confirmar() {
    const boton = screen.getByRole("button", {
        name: "Confirmar pedido"
    });

    fireEvent.submit(boton.closest("form"));
}

beforeEach(() => {
    vi.resetAllMocks();

    vi.mocked(obtenerCarrito).mockReturnValue([producto]);
    vi.mocked(listarProductosApi).mockResolvedValue([producto]);

    vi.mocked(sincronizarCarritoConProductos).mockReturnValue({
        carrito: [producto],
        advertencias: [],
        puedeContinuar: true
    });

    vi.mocked(crearPedidoApi).mockResolvedValue(pedidoConfirmado);
});

describe("Checkout conectado a pedidos de Spring Boot", () => {
    it("consulta productos reales antes de permitir confirmar", async () => {
        mostrarCheckout();
        await esperarFormularioListo();

        expect(listarProductosApi).toHaveBeenCalledTimes(1);

        expect(
            sincronizarCarritoConProductos
        ).toHaveBeenCalledWith([producto]);

        expect(
            screen.getByText("Guitarra de prueba")
        ).toBeInTheDocument();
    });

    it("confirma un retiro con precio esperado y vacia el carrito", async () => {
        mostrarCheckout();
        await esperarFormularioListo();

        fireEvent.click(
            screen.getByRole("radio", {
                name: "Retiro en tienda"
            })
        );

        confirmar();

        await waitFor(() => {
            expect(crearPedidoApi).toHaveBeenCalledWith({
                tipoEntrega: "RETIRO",
                direccion: "",
                productos: [{
                    codigo: "GA001",
                    cantidad: 1,
                    precioEsperado: 129990
                }]
            });
        });

        expect(
            await screen.findByRole("heading", {
                name: "Pedido confirmado"
            })
        ).toBeInTheDocument();

        expect(
            screen.getByText(/número de pedido:/i)
        ).toBeInTheDocument();

        expect(vaciarCarrito).toHaveBeenCalledTimes(1);
    });

    it("confirma despacho con la direccion ingresada", async () => {
        vi.mocked(crearPedidoApi).mockResolvedValue({
            ...pedidoConfirmado,
            tipoEntrega: "DESPACHO",
            direccion: "Avenida Libertad 1234"
        });

        mostrarCheckout();
        await esperarFormularioListo();

        fireEvent.change(
            screen.getByLabelText("Dirección de despacho"),
            {
                target: { value: "Avenida Libertad 1234" }
            }
        );

        confirmar();

        await waitFor(() => {
            expect(crearPedidoApi).toHaveBeenCalledWith(
                expect.objectContaining({
                    tipoEntrega: "DESPACHO",
                    direccion: "Avenida Libertad 1234"
                })
            );
        });
    });

    it("no envia una compra con direccion invalida", async () => {
        mostrarCheckout();
        await esperarFormularioListo();

        fireEvent.change(
            screen.getByLabelText("Dirección de despacho"),
            {
                target: { value: "abc" }
            }
        );

        confirmar();

        expect(
            screen.getByRole("alert")
        ).toHaveTextContent(/dirección de despacho válida/i);

        expect(crearPedidoApi).not.toHaveBeenCalled();
        expect(vaciarCarrito).not.toHaveBeenCalled();
    });

    it("si el backend rechaza la compra mantiene el carrito", async () => {
        vi.mocked(crearPedidoApi).mockRejectedValue(
            new Error("Stock insuficiente")
        );

        mostrarCheckout();
        await esperarFormularioListo();

        fireEvent.click(
            screen.getByRole("radio", {
                name: "Retiro en tienda"
            })
        );

        confirmar();

        expect(
            await screen.findByRole("alert")
        ).toHaveTextContent("Stock insuficiente");

        expect(vaciarCarrito).not.toHaveBeenCalled();
    });

    it("no crea un pedido si el precio cambia al confirmar", async () => {
        vi.mocked(sincronizarCarritoConProductos)
            .mockReturnValueOnce({
                carrito: [producto],
                advertencias: [],
                puedeContinuar: true
            })
            .mockReturnValueOnce({
                carrito: [{
                    ...producto,
                    precio: 139990
                }],
                advertencias: ["El precio cambió."],
                puedeContinuar: true
            });

        mostrarCheckout();
        await esperarFormularioListo();

        fireEvent.click(
            screen.getByRole("radio", {
                name: "Retiro en tienda"
            })
        );

        confirmar();

        expect(
            await screen.findByRole("alert")
        ).toHaveTextContent(/el catálogo cambió/i);

        expect(crearPedidoApi).not.toHaveBeenCalled();
        expect(vaciarCarrito).not.toHaveBeenCalled();
    });
});
