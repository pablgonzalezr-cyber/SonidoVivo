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
import Checkout from "../pages/Checkout";

import {
    obtenerCarrito,
    vaciarCarrito
} from "../services/carritoService";

import { crearPedido } from "../services/pedidosService";

vi.mock("../services/carritoService", () => ({
    obtenerCarrito: vi.fn(),
    vaciarCarrito: vi.fn()
}));

vi.mock("../services/pedidosService", () => ({
    crearPedido: vi.fn()
}));

const cliente = {
    id: 20,
    nombre: "Cliente Prueba",
    correo: "cliente@sonidovivo.cl",
    rol: "CLIENTE"
};

const productosCarrito = [
    {
        codigo: "GA001",
        nombre: "Guitarra Acústica Folk",
        precio: 129990,
        cantidad: 1
    }
];

beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(obtenerCarrito).mockReturnValue(productosCarrito);
});

function mostrarCheckout() {
    render(
        <MemoryRouter>
            <Checkout sesion={cliente} />
        </MemoryRouter>
    );
}

describe("Checkout y métodos de entrega", () => {

    it("muestra despacho y dirección como opción inicial", () => {

        mostrarCheckout();

        expect(
            screen.getByRole("radio", { name: "Despacho a domicilio" })
        ).toBeChecked();

        expect(
            screen.getByLabelText("Dirección de despacho")
        ).toBeInTheDocument();

    });

    it("oculta la dirección al seleccionar retiro", () => {

        mostrarCheckout();

        fireEvent.click(
            screen.getByRole("radio", { name: "Retiro en tienda" })
        );

        expect(
            screen.queryByLabelText("Dirección de despacho")
        ).not.toBeInTheDocument();

        expect(
            screen.getByRole("link", {
                name: /ver zonas referenciales en el mapa/i
            })
        ).toHaveAttribute("href", "/ubicaciones");

    });

    it("crea un pedido de retiro y vacía el carrito si funciona", () => {

        vi.mocked(crearPedido).mockReturnValue({
            id: 123,
            tipoEntrega: "RETIRO",
            direccion: "Retiro en tienda",
            total: 129990
        });

        mostrarCheckout();

        fireEvent.click(
            screen.getByRole("radio", { name: "Retiro en tienda" })
        );

        fireEvent.click(
            screen.getByRole("button", { name: "Confirmar pedido" })
        );

        expect(crearPedido).toHaveBeenCalledWith(
            expect.objectContaining({
                usuario: cliente,
                tipoEntrega: "RETIRO",
                productos: productosCarrito
            })
        );

        expect(vaciarCarrito).toHaveBeenCalledTimes(1);

        expect(
            screen.getByRole("heading", { name: "Pedido confirmado" })
        ).toBeInTheDocument();

    });

    it("muestra un error y no vacía el carrito si falla la compra", () => {

        vi.mocked(crearPedido).mockImplementation(() => {
            throw new Error("Stock insuficiente");
        });

        mostrarCheckout();

        fireEvent.click(
            screen.getByRole("radio", { name: "Retiro en tienda" })
        );

        fireEvent.click(
            screen.getByRole("button", { name: "Confirmar pedido" })
        );

        expect(
            screen.getByRole("alert")
        ).toHaveTextContent("Stock insuficiente");

        expect(vaciarCarrito).not.toHaveBeenCalled();

    });

});
