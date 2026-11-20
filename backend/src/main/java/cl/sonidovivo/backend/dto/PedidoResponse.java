package cl.sonidovivo.backend.dto;

import cl.sonidovivo.backend.model.DetallePedido;
import cl.sonidovivo.backend.model.EstadoPedido;
import cl.sonidovivo.backend.model.Pedido;
import cl.sonidovivo.backend.model.TipoEntrega;
import java.util.List;

public record PedidoResponse(
    Long id,
    Long usuarioId,
    String cliente,
    String correo,
    TipoEntrega tipoEntrega,
    String direccion,
    String fechaISO,
    EstadoPedido estado,
    Long total,
    List<Detalle> productos
) {
    public record Detalle(
        String codigo,
        String nombre,
        Integer precio,
        Integer cantidad,
        Long subtotal
    ) {
        public static Detalle desde(DetallePedido producto) {
            return new Detalle(
                producto.getCodigo(),
                producto.getNombre(),
                producto.getPrecio(),
                producto.getCantidad(),
                producto.getSubtotal()
            );
        }
    }

    public static PedidoResponse desde(Pedido pedido) {
        return new PedidoResponse(
            pedido.getId(),
            pedido.getUsuario().getId(),
            pedido.getCliente(),
            pedido.getCorreo(),
            pedido.getTipoEntrega(),
            pedido.getDireccion(),
            pedido.getFecha().toString(),
            pedido.getEstado(),
            pedido.getTotal(),
            pedido.getProductos()
                .stream()
                .map(Detalle::desde)
                .toList()
        );
    }
}
