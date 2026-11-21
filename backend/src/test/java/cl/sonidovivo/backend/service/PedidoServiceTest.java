package cl.sonidovivo.backend.service;

import cl.sonidovivo.backend.dto.PedidoRequest;
import cl.sonidovivo.backend.dto.PedidoResponse;
import cl.sonidovivo.backend.model.EstadoPedido;
import cl.sonidovivo.backend.model.Pedido;
import cl.sonidovivo.backend.model.Producto;
import cl.sonidovivo.backend.model.RolUsuario;
import cl.sonidovivo.backend.model.TipoEntrega;
import cl.sonidovivo.backend.model.Usuario;
import cl.sonidovivo.backend.repository.PedidoRepository;
import cl.sonidovivo.backend.repository.ProductoRepository;
import cl.sonidovivo.backend.repository.UsuarioRepository;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class PedidoServiceTest {
    private PedidoRepository pedidos;
    private ProductoRepository productos;
    private UsuarioRepository usuarios;
    private PedidoService service;
    private Usuario cliente;
    private Producto guitarra;

    @BeforeEach
    void preparar() {
        pedidos = mock(PedidoRepository.class);
        productos = mock(ProductoRepository.class);
        usuarios = mock(UsuarioRepository.class);
        service = new PedidoService(pedidos, productos, usuarios);

        cliente = mock(Usuario.class);
        when(cliente.isActivo()).thenReturn(true);
        when(cliente.getRol()).thenReturn(RolUsuario.CLIENTE);
        when(cliente.getId()).thenReturn(5L);
        when(cliente.getNombre()).thenReturn("Cliente");
        when(cliente.getCorreo()).thenReturn("cliente@ejemplo.cl");

        guitarra = new Producto("GA001", "Guitarras", "Guitarra", "Yamaha",
            "F310", 5, 129990, "Descripcion");
    }

    private PedidoRequest solicitud(String codigo, int cantidad, int precio) {
        return new PedidoRequest(TipoEntrega.RETIRO, "",
            List.of(new PedidoRequest.Item(codigo, cantidad, precio)));
    }

    @Test
    void compraGuardaPedidoYDescuentaStock() {
        when(usuarios.findById(5L)).thenReturn(Optional.of(cliente));
        when(productos.bloquearParaCompra("GA001")).thenReturn(Optional.of(guitarra));
        when(pedidos.saveAndFlush(any(Pedido.class))).thenAnswer(inv -> inv.getArgument(0));
        PedidoResponse respuesta = service.crear(5L, solicitud("GA001", 2, 129990));
        assertEquals(259980L, respuesta.total());
        assertEquals(3, guitarra.getStock());
        assertEquals(1, respuesta.productos().size());
        assertEquals(2, respuesta.productos().getFirst().cantidad());
        assertEquals(EstadoPedido.PENDIENTE, respuesta.estado());
        verify(pedidos).saveAndFlush(any(Pedido.class));
    }

    @Test
    void compraConPrecioDesactualizadoResponde409() {
        when(usuarios.findById(5L)).thenReturn(Optional.of(cliente));
        when(productos.bloquearParaCompra("GA001")).thenReturn(Optional.of(guitarra));
        ResponseStatusException error = assertThrows(ResponseStatusException.class,
            () -> service.crear(5L, solicitud("GA001", 1, 10)));
        assertEquals(HttpStatus.CONFLICT, error.getStatusCode());
        assertEquals(5, guitarra.getStock());
        verify(pedidos, never()).saveAndFlush(any());
    }

    @Test
    void compraSinStockResponde409() {
        when(usuarios.findById(5L)).thenReturn(Optional.of(cliente));
        when(productos.bloquearParaCompra("GA001")).thenReturn(Optional.of(guitarra));
        ResponseStatusException error = assertThrows(ResponseStatusException.class,
            () -> service.crear(5L, solicitud("GA001", 6, 129990)));
        assertEquals(HttpStatus.CONFLICT, error.getStatusCode());
        assertEquals(5, guitarra.getStock());
        verify(pedidos, never()).saveAndFlush(any());
    }

    @Test
    void clienteInactivoNoPuedeComprar() {
        when(cliente.isActivo()).thenReturn(false);
        when(usuarios.findById(5L)).thenReturn(Optional.of(cliente));
        ResponseStatusException error = assertThrows(ResponseStatusException.class,
            () -> service.crear(5L, solicitud("GA001", 1, 129990)));
        assertEquals(HttpStatus.UNAUTHORIZED, error.getStatusCode());
        verifyNoInteractions(productos);
    }

    @Test
    void cuentaVendedoraNoPuedeComprar() {
        when(cliente.getRol()).thenReturn(RolUsuario.VENDEDOR);
        when(usuarios.findById(5L)).thenReturn(Optional.of(cliente));
        ResponseStatusException error = assertThrows(ResponseStatusException.class,
            () -> service.crear(5L, solicitud("GA001", 1, 129990)));
        assertEquals(HttpStatus.FORBIDDEN, error.getStatusCode());
    }

    @Test
    void noAceptaProductosRepetidos() {
        when(usuarios.findById(5L)).thenReturn(Optional.of(cliente));
        PedidoRequest.Item item = new PedidoRequest.Item("GA001", 1, 129990);
        PedidoRequest duplicado = new PedidoRequest(TipoEntrega.RETIRO, "", List.of(item, item));
        ResponseStatusException error = assertThrows(ResponseStatusException.class,
            () -> service.crear(5L, duplicado));
        assertEquals(HttpStatus.BAD_REQUEST, error.getStatusCode());
        verifyNoInteractions(productos);
    }

    @Test
    void despachoSinDireccionResponde400() {
        when(usuarios.findById(5L)).thenReturn(Optional.of(cliente));
        PedidoRequest request = new PedidoRequest(TipoEntrega.DESPACHO, "ab",
            List.of(new PedidoRequest.Item("GA001", 1, 129990)));
        ResponseStatusException error = assertThrows(ResponseStatusException.class,
            () -> service.crear(5L, request));
        assertEquals(HttpStatus.BAD_REQUEST, error.getStatusCode());
    }

    @Test
    void permiteTransicionPendienteAPreparacion() {
        Pedido pedido = new Pedido(cliente, TipoEntrega.RETIRO, "Retiro en tienda");
        when(pedidos.bloquearParaCambioEstado(9L)).thenReturn(Optional.of(pedido));
        when(pedidos.saveAndFlush(pedido)).thenReturn(pedido);
        PedidoResponse actualizado = service.cambiarEstado(9L, EstadoPedido.EN_PREPARACION);
        assertEquals(EstadoPedido.EN_PREPARACION, actualizado.estado());
    }

    @Test
    void rechazaSaltarDePendienteAEntregado() {
        Pedido pedido = new Pedido(cliente, TipoEntrega.RETIRO, "Retiro en tienda");
        when(pedidos.bloquearParaCambioEstado(9L)).thenReturn(Optional.of(pedido));
        ResponseStatusException error = assertThrows(ResponseStatusException.class,
            () -> service.cambiarEstado(9L, EstadoPedido.ENTREGADO));
        assertEquals(HttpStatus.CONFLICT, error.getStatusCode());
        verify(pedidos, never()).saveAndFlush(any());
    }
}
