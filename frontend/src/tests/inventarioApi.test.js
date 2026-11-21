import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { obtenerToken } from "../services/authService";
import { obtenerResumenInventarioApi, listarMovimientosStockApi } from "../services/inventarioApi";

vi.mock("../services/authService", () => ({ obtenerToken: vi.fn() }));

function responder(datos, status = 200) {
    const solicitud = vi.fn().mockResolvedValue({
        ok: status >= 200 && status < 300,
        status,
        json: async () => datos
    });
    vi.stubGlobal("fetch", solicitud);
    return solicitud;
}

beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(obtenerToken).mockReturnValue("jwt-vendedor");
});

afterEach(() => vi.unstubAllGlobals());

describe("API de inventario protegido", () => {
    it("consulta resumen con umbral y JWT", async () => {
        const solicitud = responder({ totalProductos: 2, agotados: 1, stockBajo: 0, alertas: [] });
        const resultado = await obtenerResumenInventarioApi(4);
        expect(resultado.totalProductos).toBe(2);
        const [url, opciones] = solicitud.mock.calls[0];
        expect(url).toContain("/api/vendedor/inventario/resumen?umbral=4");
        expect(opciones.headers.Authorization).toBe("Bearer jwt-vendedor");
    });

    it("consulta historial filtrando por codigo", async () => {
        const solicitud = responder([{ id: 1, codigoProducto: "GA001" }]);
        const resultado = await listarMovimientosStockApi(" GA001 ");
        expect(resultado).toHaveLength(1);
        expect(solicitud.mock.calls[0][0]).toContain("?codigo=GA001");
    });

    it("impide consultar sin JWT", async () => {
        vi.mocked(obtenerToken).mockReturnValue(null);
        const solicitud = vi.fn();
        vi.stubGlobal("fetch", solicitud);
        await expect(obtenerResumenInventarioApi()).rejects.toThrow(/iniciar sesión/i);
        expect(solicitud).not.toHaveBeenCalled();
    });

    it("informa acceso denegado", async () => {
        responder(null, 403);
        await expect(listarMovimientosStockApi()).rejects.toThrow(/permisos/i);
    });
});
