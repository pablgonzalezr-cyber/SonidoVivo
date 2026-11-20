package cl.sonidovivo.backend.service;

import cl.sonidovivo.backend.dto.PedidoRequest;
import cl.sonidovivo.backend.dto.PedidoResponse;
import cl.sonidovivo.backend.model.DetallePedido;
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
import java.util.Locale;
import java.util.Map;
import java.util.TreeMap;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;

    public PedidoService(
            PedidoRepository pedidoRepository,
            ProductoRepository productoRepository,
            UsuarioRepository usuarioRepository) {

        this.pedidoRepository = pedidoRepository;
        this.productoRepository = productoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional
    public PedidoResponse crear(
            Long usuarioId,
            PedidoRequest datos) {

        Usuario usuario = usuarioRepository
            .findById(usuarioId)
            .filter(Usuario::isActivo)
            .orElseThrow(() ->
                new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "La sesion no es valida."
                )
            );

        if (usuario.getRol() != RolUsuario.CLIENTE) {
            throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "Solo los clientes pueden realizar compras."
            );
        }

        String direccion;

        if (datos.tipoEntrega() == TipoEntrega.RETIRO) {
            direccion = "Retiro en tienda";
        } else {
            direccion = datos.direccion() == null
                ? ""
                : datos.direccion().trim();

            if (
                direccion.length() < 5 ||
                direccion.length() > 255
            ) {
                throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Ingresa una direccion de despacho valida."
                );
            }
        }

        Map<String, PedidoRequest.Item> items =
            new TreeMap<>();

        for (PedidoRequest.Item item : datos.productos()) {
            String codigo = item.codigo()
                .trim()
                .toUpperCase(Locale.ROOT);

            if (items.putIfAbsent(codigo, item) != null) {
                throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "No repitas el mismo producto en el pedido."
                );
            }
        }

        Pedido pedido = new Pedido(
            usuario,
            datos.tipoEntrega(),
            direccion
        );

        for (Map.Entry<String, PedidoRequest.Item> entrada :
                items.entrySet()) {

            String codigo = entrada.getKey();
            PedidoRequest.Item item = entrada.getValue();

            Producto producto = productoRepository
                .bloquearParaCompra(codigo)
                .orElseThrow(() ->
                    new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "El producto " + codigo +
                        " ya no esta disponible."
                    )
                );

            if (
                !producto.getPrecio().equals(
                    item.precioEsperado()
                )
            ) {
                throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "El precio de " + producto.getNombre() +
                    " cambio. Actualiza el carrito antes de comprar."
                );
            }

            if (producto.getStock() < item.cantidad()) {
                throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Stock insuficiente para " +
                    producto.getNombre() +
                    ". Disponibles: " +
                    producto.getStock()
                );
            }

            producto.setStock(
                producto.getStock() - item.cantidad()
            );

            DetallePedido detalle = new DetallePedido(
                producto,
                item.cantidad()
            );

            pedido.agregarProducto(detalle);
        }

        Pedido guardado = pedidoRepository.saveAndFlush(pedido);

        return PedidoResponse.desde(guardado);
    }

    @Transactional(readOnly = true)
    public List<PedidoResponse> obtenerMisPedidos(
            Long usuarioId) {

        return pedidoRepository
            .findByUsuario_IdOrderByFechaDesc(usuarioId)
            .stream()
            .map(PedidoResponse::desde)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<PedidoResponse> listarTodos() {
        return pedidoRepository
            .findAllByOrderByFechaDesc()
            .stream()
            .map(PedidoResponse::desde)
            .toList();
    }

    @Transactional
    public PedidoResponse cambiarEstado(
            Long pedidoId,
            EstadoPedido nuevoEstado) {

        Pedido pedido = pedidoRepository
            .bloquearParaCambioEstado(pedidoId)
            .orElseThrow(() ->
                new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "El pedido no existe."
                )
            );

        if (!transicionPermitida(pedido, nuevoEstado)) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "No se permite ese cambio de estado."
            );
        }

        pedido.setEstado(nuevoEstado);

        return PedidoResponse.desde(
            pedidoRepository.saveAndFlush(pedido)
        );
    }

    private boolean transicionPermitida(
            Pedido pedido,
            EstadoPedido nuevoEstado) {

        return switch (pedido.getEstado()) {
            case PENDIENTE ->
                nuevoEstado == EstadoPedido.EN_PREPARACION;

            case EN_PREPARACION ->
                pedido.getTipoEntrega() == TipoEntrega.RETIRO
                    ? nuevoEstado == EstadoPedido.LISTO_PARA_RETIRO
                    : nuevoEstado == EstadoPedido.ENVIADO;

            case LISTO_PARA_RETIRO, ENVIADO ->
                nuevoEstado == EstadoPedido.ENTREGADO;

            case ENTREGADO -> false;
        };
    }
}
