package cl.sonidovivo.backend.service;

import cl.sonidovivo.backend.model.Producto;
import cl.sonidovivo.backend.repository.ProductoRepository;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class ProductoBusquedaTest {
    @Test
    void consultarConFiltrosUtilizaEspecificacionesYOrden() {
        ProductoRepository repo = mock(ProductoRepository.class);
        ProductoService service = new ProductoService(repo);
        when(repo.findAll(any(Specification.class), any(Sort.class))).thenReturn(List.of());
        var respuesta = service.buscar("Yamaha", "Guitarras", 10000, 300000, true, "precio_asc");
        assertTrue(respuesta.isEmpty());
        verify(repo).findAll(any(Specification.class), eq(
            Sort.by("precio").ascending().and(Sort.by("codigo"))));
    }

    @Test
    void validaRangoInvertido() {
        ProductoRepository repo = mock(ProductoRepository.class);
        ProductoService service = new ProductoService(repo);
        ResponseStatusException error = assertThrows(ResponseStatusException.class,
            () -> service.buscar("", "", 500000, 100000, false, "codigo"));
        assertEquals(HttpStatus.BAD_REQUEST, error.getStatusCode());
        verifyNoInteractions(repo);
    }

    @Test
    void validaOrdenamientoDesconocido() {
        ProductoRepository repo = mock(ProductoRepository.class);
        ProductoService service = new ProductoService(repo);
        ResponseStatusException error = assertThrows(ResponseStatusException.class,
            () -> service.buscar("", "", null, null, false, "DROP"));
        assertEquals(HttpStatus.BAD_REQUEST, error.getStatusCode());
    }

    @Test
    void listaCategoriasDesdeLaBD() {
        ProductoRepository repo = mock(ProductoRepository.class);
        when(repo.listarCategorias()).thenReturn(List.of("Bajos", "Guitarras"));
        ProductoService service = new ProductoService(repo);
        assertEquals(2, service.listarCategorias().size());
        verify(repo).listarCategorias();
    }
}

