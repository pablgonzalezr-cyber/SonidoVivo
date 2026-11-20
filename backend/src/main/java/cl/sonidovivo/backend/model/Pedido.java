
package cl.sonidovivo.backend.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pedidos")
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(nullable = false, length = 120)
    private String cliente;

    @Column(nullable = false, length = 160)
    private String correo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TipoEntrega tipoEntrega;

    @Column(nullable = false, length = 255)
    private String direccion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private EstadoPedido estado;

    @Column(nullable = false, updatable = false)
    private Instant fecha;

    @Column(nullable = false)
    private Long total;

    @OneToMany(
        mappedBy = "pedido",
        cascade = CascadeType.ALL,
        orphanRemoval = true
    )
    private List<DetallePedido> productos = new ArrayList<>();

    public Pedido() {
    }

    public Pedido(
            Usuario usuario,
            TipoEntrega tipoEntrega,
            String direccion) {

        this.usuario = usuario;
        this.cliente = usuario.getNombre();
        this.correo = usuario.getCorreo();
        this.tipoEntrega = tipoEntrega;
        this.direccion = direccion;
        this.estado = EstadoPedido.PENDIENTE;
        this.fecha = Instant.now();
        this.total = 0L;
    }

    public void agregarProducto(DetallePedido detalle) {
        detalle.setPedido(this);
        productos.add(detalle);
        total = Math.addExact(total, detalle.getSubtotal());
    }

    public Long getId() {
        return id;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public String getCliente() {
        return cliente;
    }

    public String getCorreo() {
        return correo;
    }

    public TipoEntrega getTipoEntrega() {
        return tipoEntrega;
    }

    public String getDireccion() {
        return direccion;
    }

    public EstadoPedido getEstado() {
        return estado;
    }

    public void setEstado(EstadoPedido estado) {
        this.estado = estado;
    }

    public Instant getFecha() {
        return fecha;
    }

    public Long getTotal() {
        return total;
    }

    public List<DetallePedido> getProductos() {
        return productos;
    }
}
