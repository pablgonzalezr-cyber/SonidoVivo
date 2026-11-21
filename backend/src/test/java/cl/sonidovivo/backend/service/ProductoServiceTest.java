package cl.sonidovivo.backend.service;

import cl.sonidovivo.backend.dto.ProductoRequest;
import cl.sonidovivo.backend.model.Producto;
import cl.sonidovivo.backend.repository.ProductoRepository;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class ProductoServiceTest {
    private ProductoRepository repository;
    private ProductoService service;
    private InventarioService inventario;

    @BeforeEach
    void preparar() {
        repository = mock(ProductoRepository.class);
        inventario = mock(InventarioService.class);
        service = new ProductoService(repository, inventario);
    }

    private ProductoRequest datos(String codigo, int stock) {
        return new ProductoRequest(codigo, "Guitarras", "Guitarra", "Yamaha", "F310",
            stock, 129990, "Descripcion", "");
    }

    @Test
    void creaProductoConCodigoNormalizado() {
        when(repository.saveAndFlush(any(Producto.class))).thenAnswer(inv -> inv.getArgument(0));
        Producto creado = service.crear(datos("ga999", 5));
        assertEquals("GA999", creado.getCodigo());
        assertEquals(5, creado.getStock());
        verify(repository).saveAndFlush(any(Producto.class));
    }

    @Test
    void noPermiteCodigoDuplicado() {
        when(repository.existsByCodigoIgnoreCase("GA999")).thenReturn(true);
        ResponseStatusException error = assertThrows(ResponseStatusException.class,
            () -> service.crear(datos("GA999", 5)));
        assertEquals(HttpStatus.CONFLICT, error.getStatusCode());
        verify(repository, never()).saveAndFlush(any());
    }

    @Test
    void productoInexistenteResponde404() {
        when(repository.findByCodigoIgnoreCase("GA404")).thenReturn(Optional.empty());
        ResponseStatusException error = assertThrows(ResponseStatusException.class,
            () -> service.buscarPorCodigo("GA404"));
        assertEquals(HttpStatus.NOT_FOUND, error.getStatusCode());
    }

    @Test
    void actualizaStockSinCambiarDatosComerciales() {
        Producto producto = new Producto("GA001", "Guitarras", "Guitarra", "Yamaha",
            "F310", 5, 129990, "Descripcion");
        when(repository.bloquearParaCompra("GA001")).thenReturn(Optional.of(producto));
        when(repository.saveAndFlush(producto)).thenReturn(producto);
        service.actualizarStock("GA001", 9);
        assertEquals(9, producto.getStock());
        assertEquals(129990, producto.getPrecio());
        assertEquals("Yamaha", producto.getMarca());
        verify(inventario).registrar(eq(cl.sonidovivo.backend.model.TipoMovimientoStock.AJUSTE),
            eq(producto), eq(5), eq(9), isNull(), isNull(), anyString());
    }

    @Test
    void rechazaStockNegativo() {
        ResponseStatusException error = assertThrows(ResponseStatusException.class,
            () -> service.actualizarStock("GA001", -1));
        assertEquals(HttpStatus.BAD_REQUEST, error.getStatusCode());
        verifyNoInteractions(repository);
    }

    @Test
    void rechazaCambioDeCodigoEnEdicion() {
        Producto producto = new Producto("GA001", "Guitarras", "Guitarra", "Yamaha",
            "F310", 5, 129990, "Descripcion");
        when(repository.bloquearParaCompra("GA001")).thenReturn(Optional.of(producto));
        ResponseStatusException error = assertThrows(ResponseStatusException.class,
            () -> service.actualizar("GA001", datos("GA999", 5)));
        assertEquals(HttpStatus.BAD_REQUEST, error.getStatusCode());
        verify(repository, never()).saveAndFlush(any());
    }
}

