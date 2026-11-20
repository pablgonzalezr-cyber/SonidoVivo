
import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    vi
} from "vitest";

import { obtenerToken } from "../services/authService";
import { crearPedidoApi } from "../services/pedidosApi";

vi.mock("../services/authService", () => ({
    obtenerToken: vi.fn()
}));

const productos = [{
    codigo: "GA001",
    cantidad: 2,
    precioEsperado: 129990
}];

beforeEach(() => {
    vi.resetAllMocks();

    vi.mocked(obtenerToken).mockReturnValue("jwt-cliente");
});

afterEach(() => {
    vi.unstubAllGlobals();
});

function simularCompra() {
    const solicitud = vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => ({
            id: 31,
            estado: "PENDIENTE"
        })
    });

    vi.stubGlobal("fetch", solicitud);
    return solicitud;
}

describe("Tipos de entrega enviados a Spring Boot", () => {
    it("envia retiro en tienda con productos y precios esperados", async () => {
        const solicitud = simularCompra();

        await crearPedidoApi({
            tipoEntrega: "RETIRO",
            direccion: "",
            productos
        });

        const opciones = solicitud.mock.calls[0][1];

        expect(JSON.parse(opciones.body)).toEqual({
            tipoEntrega: "RETIRO",
            direccion: "",
            productos
        });

        expect(opciones.headers.Authorization).toBe(
            "Bearer jwt-cliente"
        );
    });

    it("envia despacho con direccion", async () => {
        const solicitud = simularCompra();

        await crearPedidoApi({
            tipoEntrega: "DESPACHO",
            direccion: "Avenida Libertad 1234",
            productos
        });

        expect(
            JSON.parse(solicitud.mock.calls[0][1].body)
        ).toEqual({
            tipoEntrega: "DESPACHO",
            direccion: "Avenida Libertad 1234",
            productos
        });
    });

    it("informa rechazo por cambio de precio sin simular compra local", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue({
                ok: false,
                status: 409,
                json: async () => ({
                    detail: "El precio de la guitarra cambio."
                })
            })
        );

        await expect(
            crearPedidoApi({
                tipoEntrega: "RETIRO",
                direccion: "",
                productos
            })
        ).rejects.toThrow(/precio/i);
    });
});
