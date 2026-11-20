import { describe, expect, it } from "vitest";

import {
    generarReporteVentas
} from "../services/reportesService";

const pedidos = [
    {
        id: 1,
        fechaISO: "2026-10-01T15:00:00.000Z",
        cliente: "Cliente Uno",
        estado: "PENDIENTE",
        tipoEntrega: "DESPACHO",
        total: 20000,
        productos: [{
            codigo: "GA001",
            cantidad: 2
        }]
    },
    {
        id: 2,
        fechaISO: "2026-10-10T15:00:00.000Z",
        cliente: "Cliente Dos",
        estado: "ENTREGADO",
        tipoEntrega: "RETIRO",
        total: 10000,
        productos: [{
            codigo: "AC001",
            cantidad: 1
        }]
    }
];

describe("Reportes calculados desde pedidos de la API", () => {
    it("calcula los indicadores generales", () => {
        const reporte = generarReporteVentas(pedidos);

        expect(reporte.cantidadPedidos).toBe(2);
        expect(reporte.montoTotal).toBe(30000);
        expect(reporte.unidades).toBe(3);
        expect(reporte.ticketPromedio).toBe(15000);
    });

    it("agrupa por estado y tipo de entrega", () => {
        const reporte = generarReporteVentas(pedidos);

        expect(reporte.porEstado.PENDIENTE).toBe(1);
        expect(reporte.porEstado.ENTREGADO).toBe(1);
        expect(reporte.porEntrega.DESPACHO).toBe(1);
        expect(reporte.porEntrega.RETIRO).toBe(1);
    });

    it("filtra por fecha inicial y final", () => {
        const reporte = generarReporteVentas(
            pedidos,
            "2026-10-01",
            "2026-10-01"
        );

        expect(reporte.cantidadPedidos).toBe(1);
        expect(reporte.montoTotal).toBe(20000);
        expect(reporte.pedidos[0].id).toBe(1);
    });

    it("ordena los pedidos desde el mas reciente", () => {
        const reporte = generarReporteVentas(pedidos);

        expect(
            reporte.pedidos.map((pedido) => pedido.id)
        ).toEqual([2, 1]);
    });

    it("maneja periodos vacios", () => {
        const reporte = generarReporteVentas(
            pedidos,
            "2026-09-01",
            "2026-09-30"
        );

        expect(reporte.cantidadPedidos).toBe(0);
        expect(reporte.montoTotal).toBe(0);
        expect(reporte.unidades).toBe(0);
        expect(reporte.ticketPromedio).toBe(0);
        expect(reporte.pedidos).toEqual([]);
    });

    it("maneja correctamente listas vacias", () => {
        const reporte = generarReporteVentas([]);

        expect(reporte.cantidadPedidos).toBe(0);

        expect(reporte.porEntrega).toEqual({
            DESPACHO: 0,
            RETIRO: 0
        });
    });
});
