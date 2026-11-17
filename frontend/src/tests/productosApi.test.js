import { afterEach, describe, expect, it, vi } from "vitest";
import { listarProductosApi, obtenerProductoApi } from "../services/productosApi";

afterEach(() => {
    vi.unstubAllGlobals();
});

describe("Servicio HTTP de productos", () => {
    it("lista productos cuando la API responde 200", async () => {
        const productos = [{ codigo: "GA001", nombre: "Guitarra" }];
        const solicitud = vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => productos
        });
        vi.stubGlobal("fetch", solicitud);

        const resultado = await listarProductosApi();
        expect(resultado).toEqual(productos);
        expect(solicitud).toHaveBeenCalledWith(
            expect.stringContaining("/api/productos"),
            expect.objectContaining({ method: "GET" })
        );
    });

    it("informa errores HTTP de la API", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
            ok: false,
            status: 500
        }));
        await expect(listarProductosApi())
            .rejects.toThrow("Error del servidor: HTTP 500");
    });

    it("consulta por codigo y maneja un producto inexistente", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
            ok: false,
            status: 404
        }));
        await expect(obtenerProductoApi("XX999"))
            .rejects.toThrow("El producto solicitado no existe");
    });
});
