package cl.sonidovivo.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "movimientos_stock", indexes = {
    @Index(name = "idx_movimiento_codigo_fecha", columnList = "codigo_producto, fecha")
})
public class MovimientoStock {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "codigo_producto", nullable = false, length = 20)
    private String codigoProducto;

    @Column(nullable = false, length = 160)
    private String nombreProducto;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TipoMovimientoStock tipo;

    @Column(nullable = false)
    private int stockAntes;

    @Column(nullable = false)
    private int stockDespues;

    @Column(nullable = false)
    private int variacion;

    private Long usuarioId;
    private Long pedidoId;

    @Column(nullable = false, updatable = false)
    private Instant fecha;

    @Column(nullable = false, length = 255)
    private String detalle;

    public MovimientoStock() {
    }

    public MovimientoStock(TipoMovimientoStock tipo, Producto producto,
            int antes, int despues, Long usuarioId, Long pedidoId, String detalle) {
        this.tipo = tipo;
        this.codigoProducto = producto.getCodigo();
        this.nombreProducto = producto.getNombre();
        this.stockAntes = antes;
        this.stockDespues = despues;
        this.variacion = despues - antes;
        this.usuarioId = usuarioId;
        this.pedidoId = pedidoId;
        this.detalle = detalle;
        this.fecha = Instant.now();
    }

    public Long getId() { return id; }
    public String getCodigoProducto() { return codigoProducto; }
    public String getNombreProducto() { return nombreProducto; }
    public TipoMovimientoStock getTipo() { return tipo; }
    public int getStockAntes() { return stockAntes; }
    public int getStockDespues() { return stockDespues; }
    public int getVariacion() { return variacion; }
    public Long getUsuarioId() { return usuarioId; }
    public Long getPedidoId() { return pedidoId; }
    public Instant getFecha() { return fecha; }
    public String getDetalle() { return detalle; }
}

