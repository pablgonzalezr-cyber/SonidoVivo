
import {
    beforeEach,
    describe,
    it,
    expect,
    vi
} from "vitest";

import {
    obtenerPedidos
} from "../services/pedidosService";

import {
    generarReporteVentas
} from "../services/reportesService";

vi.mock("../services/pedidosService", () => ({
    obtenerPedidos: vi.fn()
}));

beforeEach(() => {

    vi.mocked(obtenerPedidos).mockReturnValue([
        {
            id: 1,
            fecha: "01/10/2026, 10:00:00",
            fechaISO: "2026-10-01T12:00:00.000Z",
            cliente: "Cliente Uno",
            estado: "PENDIENTE",
            tipoEntrega: "DESPACHO",
            total: 20000,
            productos: [
                { codigo: "GE001", cantidad: 2 }
            ]
        },
        {
            id: 2,
            fecha: "10/10/2026, 10:00:00",
            fechaISO: "2026-10-10T12:00:00.000Z",
            cliente: "Cliente Dos",
            estado: "ENTREGADO",
            tipoEntrega: "RETIRO",
            total: 10000,
            productos: [
                { codigo: "AC001", cantidad: 1 }
            ]
        }
    ]);

});

describe("Reportes de ventas", () => {

    it("calcula los indicadores generales", () => {

        const reporte = generarReporteVentas();

        expect(reporte.cantidadPedidos).toBe(2);
        expect(reporte.montoTotal).toBe(30000);
        expect(reporte.unidades).toBe(3);
        expect(reporte.ticketPromedio).toBe(15000);

    });

    it("agrupa pedidos por estado y entrega", () => {

        const reporte = generarReporteVentas();

        expect(reporte.porEstado.PENDIENTE).toBe(1);
        expect(reporte.porEstado.ENTREGADO).toBe(1);
        expect(reporte.porEntrega.DESPACHO).toBe(1);
        expect(reporte.porEntrega.RETIRO).toBe(1);

    });

    it("permite filtrar por fechas", () => {

        const reporte = generarReporteVentas(
            "2026-10-01",
            "2026-10-01"
        );

        expect(reporte.cantidadPedidos).toBe(1);
        expect(reporte.montoTotal).toBe(20000);

    });

    it("maneja períodos sin pedidos", () => {

        const reporte = generarReporteVentas(
            "2026-09-01",
            "2026-09-30"
        );

        expect(reporte.cantidadPedidos).toBe(0);
        expect(reporte.montoTotal).toBe(0);
        expect(reporte.ticketPromedio).toBe(0);

    });

});
