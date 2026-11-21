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
    listarProductosApi,
    listarCategoriasApi,
    obtenerProductoApi,
    crearProductoApi,
    actualizarProductoApi,
    eliminarProductoApi,
    actualizarStockApi
} from "../services/productosApi";

vi.mock("../services/authService", () => ({
    obtenerToken: vi.fn()
}));

const producto = {
    codigo: "GA001",
    nombre: "Guitarra",
    categoria: "Guitarras",
    marca: "Yamaha",
    modelo: "F310",
    precio: 129990,
    stock: 8,
    descripcion: "",
    imagen: ""
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
    vi.clearAllMocks();
    vi.mocked(obtenerToken).mockReturnValue("jwt-de-prueba");
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe("API REST de productos", () => {
    it("lista los productos publicos", async () => {
        const solicitud = simularRespuesta([producto]);

        const resultado = await listarProductosApi();

        expect(resultado).toEqual([producto]);
        expect(solicitud).toHaveBeenCalledWith(
            expect.stringContaining("/api/productos"),
            expect.objectContaining({ method: "GET" })
        );
    });

    it("consulta un producto por codigo", async () => {
        const solicitud = simularRespuesta(producto);

        const resultado = await obtenerProductoApi("GA001");

        expect(resultado).toEqual(producto);

        expect(solicitud.mock.calls[0][0]).toContain(
            "/api/productos/GA001"
        );
    });

    it("crea productos con un JWT", async () => {
        const solicitud = simularRespuesta(producto, 201);

        await crearProductoApi(producto);

        const opciones = solicitud.mock.calls[0][1];

        expect(opciones.method).toBe("POST");
        expect(opciones.headers.Authorization).toBe(
            "Bearer jwt-de-prueba"
        );
        expect(JSON.parse(opciones.body)).toEqual(producto);
    });

    it("actualiza productos con PUT", async () => {
        const solicitud = simularRespuesta(producto);

        await actualizarProductoApi("GA001", producto);

        const [url, opciones] = solicitud.mock.calls[0];

        expect(url).toContain("/api/productos/GA001");
        expect(opciones.method).toBe("PUT");
        expect(JSON.parse(opciones.body)).toEqual(producto);
    });

    it("elimina productos con DELETE", async () => {
        const solicitud = simularRespuesta(null, 204);

        const resultado = await eliminarProductoApi("GA001");

        expect(resultado).toBeNull();

        const [url, opciones] = solicitud.mock.calls[0];

        expect(url).toContain("/api/productos/GA001");
        expect(opciones.method).toBe("DELETE");
    });

    it("actualiza el stock enviando JWT", async () => {
        const solicitud = simularRespuesta({
            ...producto,
            stock: 12
        });

        const actualizado = await actualizarStockApi(
            "GA001",
            12
        );

        const [url, opciones] = solicitud.mock.calls[0];

        expect(url).toContain(
            "/api/productos/GA001/stock"
        );

        expect(opciones.method).toBe("PUT");
        expect(opciones.headers.Authorization).toBe(
            "Bearer jwt-de-prueba"
        );

        expect(JSON.parse(opciones.body)).toEqual({
            stock: 12
        });

        expect(actualizado.stock).toBe(12);
    });

    it("rechaza operaciones protegidas sin JWT", async () => {
        vi.mocked(obtenerToken).mockReturnValue(null);

        const solicitud = vi.fn();
        vi.stubGlobal("fetch", solicitud);

        await expect(
            actualizarStockApi("GA001", 10)
        ).rejects.toThrow(/debes iniciar sesión/i);

        expect(solicitud).not.toHaveBeenCalled();
    });

    it("informa cuando el backend devuelve 403", async () => {
        simularRespuesta(null, 403);

        await expect(
            actualizarStockApi("GA001", 10)
        ).rejects.toThrow(/no tienes permisos/i);
    });

    it("informa cuando un producto no existe", async () => {
        simularRespuesta(null, 404);

        await expect(
            obtenerProductoApi("XX999")
        ).rejects.toThrow(/producto solicitado no existe/i);
    });

    it("envia filtros y ordenamiento como parametros HTTP", async () => {
        const solicitud = simularRespuesta([producto]);
        await listarProductosApi({ filtros: {
            texto: "Yamaha", categoria: "Guitarras", precioMin: "10000",
            precioMax: "300000", disponible: true, orden: "precio_asc"
        } });
        const url = new URL(solicitud.mock.calls[0][0]);
        expect(url.pathname).toBe("/api/productos");
        expect(url.searchParams.get("texto")).toBe("Yamaha");
        expect(url.searchParams.get("categoria")).toBe("Guitarras");
        expect(url.searchParams.get("precioMin")).toBe("10000");
        expect(url.searchParams.get("precioMax")).toBe("300000");
        expect(url.searchParams.get("disponible")).toBe("true");
        expect(url.searchParams.get("orden")).toBe("precio_asc");
    });

    it("lista las categorias desde Spring Boot", async () => {
        const solicitud = simularRespuesta(["Guitarras", "Bajos"]);
        const resultado = await listarCategoriasApi();
        expect(resultado).toEqual(["Guitarras", "Bajos"]);
        expect(solicitud.mock.calls[0][0]).toContain("/api/productos/categorias");
    });

    it("informa errores del servidor", async () => {
        simularRespuesta(null, 500);

        await expect(
            listarProductosApi()
        ).rejects.toThrow(
            "Error del servidor: HTTP 500."
        );
    });
});