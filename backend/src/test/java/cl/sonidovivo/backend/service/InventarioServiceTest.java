package cl.sonidovivo.backend.service;

import cl.sonidovivo.backend.dto.InventarioResumen;
import cl.sonidovivo.backend.model.MovimientoStock;
import cl.sonidovivo.backend.model.Producto;
import cl.sonidovivo.backend.model.TipoMovimientoStock;
import cl.sonidovivo.backend.repository.MovimientoStockRepository;
import cl.sonidovivo.backend.repository.ProductoRepository;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class InventarioServiceTest {
    private ProductoRepository productos;
    private MovimientoStockRepository movimientos;
    private InventarioService service;

    @BeforeEach
    void preparar() {
        productos = mock(ProductoRepository.class);
        movimientos = mock(MovimientoStockRepository.class);
        service = new InventarioService(productos, movimientos);
    }

    private Producto producto(String codigo, int stock) {
        return new Producto(codigo, "Guitarras", "Instrumento " + codigo,
            "Marca", "Modelo", stock, 10000, "");
    }

    @Test
    void cuentaAgotadosYStockBajoDesdeBD() {
        when(productos.findAll(Sort.by("codigo")))
            .thenReturn(List.of(producto("GA001", 0), producto("GA002", 3), producto("GA003", 10)));
        InventarioResumen reporte = service.resumen(5);
        assertEquals(3, reporte.totalProductos());
        assertEquals(13L, reporte.unidadesTotales());
        assertEquals(1L, reporte.agotados());
        assertEquals(1L, reporte.stockBajo());
        assertEquals(2, reporte.alertas().size());
    }

    @Test
    void rechazoDeUmbralNegativo() {
        ResponseStatusException error = assertThrows(ResponseStatusException.class,
            () -> service.resumen(-1));
        assertEquals(HttpStatus.BAD_REQUEST, error.getStatusCode());
    }

    @Test
    void noRegistraAjusteSinDiferencia() {
        Producto guitarra = producto("GA001", 5);
        service.registrar(TipoMovimientoStock.AJUSTE, guitarra, 5, 5, 2L, null, "Sin cambio");
        verifyNoInteractions(movimientos);
    }

    @Test
    void registraMovimientoConActorYVariacion() {
        Producto guitarra = producto("GA001", 3);
        service.registrar(TipoMovimientoStock.AJUSTE, guitarra, 5, 3, 2L, null, "Ajuste");
        var captor = org.mockito.ArgumentCaptor.forClass(MovimientoStock.class);
        verify(movimientos).save(captor.capture());
        MovimientoStock movimiento = captor.getValue();
        assertEquals(-2, movimiento.getVariacion());
        assertEquals(2L, movimiento.getUsuarioId());
        assertEquals("GA001", movimiento.getCodigoProducto());
    }

    @Test
    void historialSePuedeFiltrarPorCodigo() {
        service.historial(" GA001 ");
        verify(movimientos).findTop100ByCodigoProductoIgnoreCaseOrderByFechaDescIdDesc("GA001");
    }
}
