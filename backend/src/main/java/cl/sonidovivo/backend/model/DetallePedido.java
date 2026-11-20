package cl.sonidovivo.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "detalle_pedidos")
public class DetallePedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pedido_id", nullable = false)
    private Pedido pedido;

    @Column(nullable = false, length = 20)
    private String codigo;

    @Column(nullable = false, length = 160)
    private String nombre;

    @Column(nullable = false)
    private Integer precio;

    @Column(nullable = false)
    private Integer cantidad;

    @Column(nullable = false)
    private Long subtotal;

    public DetallePedido() {
    }

    public DetallePedido(Producto producto, Integer cantidad) {
        this.codigo = producto.getCodigo();
        this.nombre = producto.getNombre();
        this.precio = producto.getPrecio();
        this.cantidad = cantidad;
        this.subtotal = (long) precio * cantidad;
    }

    public Long getId() {
        return id;
    }

    public Pedido getPedido() {
        return pedido;
    }

    public void setPedido(Pedido pedido) {
        this.pedido = pedido;
    }

    public String getCodigo() {
        return codigo;
    }

    public String getNombre() {
        return nombre;
    }

    public Integer getPrecio() {
        return precio;
    }

    public Integer getCantidad() {
        return cantidad;
    }

    public Long getSubtotal() {
        return subtotal;
    }
}
