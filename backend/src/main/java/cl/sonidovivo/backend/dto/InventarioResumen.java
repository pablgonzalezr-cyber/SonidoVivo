package cl.sonidovivo.backend.dto;

import cl.sonidovivo.backend.model.Producto;
import java.util.List;

public record InventarioResumen(
    int totalProductos,
    long unidadesTotales,
    long agotados,
    long stockBajo,
    int umbral,
    List<Producto> alertas
) {
}
