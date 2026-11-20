
import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    vi
} from "vitest";

import { obtenerToken } from "../services/authService";

import {
    crearPedidoApi,
    obtenerMisPedidosApi,
    listarPedidosApi,
    cambiarEstadoPedidoApi
} from "../services/pedidosApi";

vi.mock("../services/authService", () => ({
    obtenerToken: vi.fn()
}));

const pedido = {
    id: 31,
    usuarioId: 20,
    cliente: "Cliente Prueba",
    estado: "PENDIENTE",
    tipoEntrega: "RETIRO",
    direccion: "Retiro en tienda",
    fechaISO: "2026-11-19T18:00:00Z",
    total: 129990,
    productos: [{
        codigo: "GA001",
        nombre: "Guitarra de prueba",
        precio: 129990,
        cantidad: 1,
        subtotal: 129990
    }]
};

function simularRespuesta(datos, estado = 200) {
    const solicitud = vi.fn().mockResolvedValue({
        ok: estado >= 200 && estado < 300,
        status: estado,
        json: async () => datos
    });

    vi.stubGlobal("fetch", solicitud);
    return solicitud;
}

beforeEach(() => {
    vi.resetAllMocks();

    vi.mocked(obtenerToken).mockReturnValue("jwt-prueba");
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe("API REST de pedidos", () => {
    it("crea una compra mediante POST y envia el JWT", async () => {
        const solicitud = simularRespuesta(pedido, 201);

        const datos = {
            tipoEntrega: "RETIRO",
            direccion: "",
            productos: [{
                codigo: "GA001",
                cantidad: 1,
                precioEsperado: 129990
            }]
        };

        const resultado = await crearPedidoApi(datos);
        const [url, opciones] = solicitud.mock.calls[0];

        expect(url).toBe(
            "http://localhost:8080/api/pedidos"
        );

        expect(opciones.method).toBe("POST");

        expect(opciones.headers.Authorization).toBe(
            "Bearer jwt-prueba"
        );

        expect(JSON.parse(opciones.body)).toEqual(datos);
        expect(resultado).toEqual(pedido);
    });

    it("consulta el historial del cliente", async () => {
        const solicitud = simularRespuesta([pedido]);

        const resultado = await obtenerMisPedidosApi();

        expect(resultado).toEqual([pedido]);

        expect(solicitud.mock.calls[0][0]).toBe(
            "http://localhost:8080/api/pedidos/mis"
        );
    });

    it("lista todos los pedidos para el personal autorizado", async () => {
        const solicitud = simularRespuesta([pedido]);

        const resultado = await listarPedidosApi();

        expect(resultado).toHaveLength(1);

        expect(solicitud.mock.calls[0][0]).toBe(
            "http://localhost:8080/api/pedidos"
        );
    });

    it("actualiza el estado mediante PUT", async () => {
        const solicitud = simularRespuesta({
            ...pedido,
            estado: "EN_PREPARACION"
        });

        const resultado = await cambiarEstadoPedidoApi(
            31,
            "EN_PREPARACION"
        );

        const [url, opciones] = solicitud.mock.calls[0];

        expect(url).toBe(
            "http://localhost:8080/api/pedidos/31/estado"
        );

        expect(opciones.method).toBe("PUT");

        expect(JSON.parse(opciones.body)).toEqual({
            estado: "EN_PREPARACION"
        });

        expect(resultado.estado).toBe("EN_PREPARACION");
    });

    it("no envia peticiones si falta el JWT", async () => {
        vi.mocked(obtenerToken).mockReturnValue(null);

        const solicitud = vi.fn();
        vi.stubGlobal("fetch", solicitud);

        await expect(
            crearPedidoApi({})
        ).rejects.toThrow(/debes iniciar sesión/i);

        expect(solicitud).not.toHaveBeenCalled();
    });

    it("informa rechazo por falta de permisos", async () => {
        simularRespuesta(null, 403);

        await expect(
            listarPedidosApi()
        ).rejects.toThrow(/no tiene permisos/i);
    });

    it("informa sesion vencida", async () => {
        simularRespuesta(null, 401);

        await expect(
            obtenerMisPedidosApi()
        ).rejects.toThrow(
            /no es válida o ha expirado/i
        );
    });

    it("informa el cambio de precio o stock", async () => {
        simularRespuesta({
            detail: "Stock insuficiente"
        }, 409);

        await expect(
            crearPedidoApi({})
        ).rejects.toThrow("Stock insuficiente");
    });

    it("rechaza respuestas que no sean listas", async () => {
        simularRespuesta({ id: 31 });

        await expect(
            listarPedidosApi()
        ).rejects.toThrow(/lista válida/i);
    });

    it("informa fallos de conexion", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn().mockRejectedValue(
                new Error("Sin conexión")
            )
        );

        await expect(
            listarPedidosApi()
        ).rejects.toThrow(
            /no se pudo conectar con spring boot/i
        );
    });
});
