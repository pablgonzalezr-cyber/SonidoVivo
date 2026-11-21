package cl.sonidovivo.backend.service;

import cl.sonidovivo.backend.dto.InventarioResumen;
import cl.sonidovivo.backend.model.MovimientoStock;
import cl.sonidovivo.backend.model.Producto;
import cl.sonidovivo.backend.model.TipoMovimientoStock;
import cl.sonidovivo.backend.repository.MovimientoStockRepository;
import cl.sonidovivo.backend.repository.ProductoRepository;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class InventarioService {
    private final ProductoRepository productos;
    private final MovimientoStockRepository movimientos;

    public InventarioService(ProductoRepository productos, MovimientoStockRepository movimientos) {
        this.productos = productos;
        this.movimientos = movimientos;
    }

    public void registrar(TipoMovimientoStock tipo, Producto producto,
            int antes, int despues, Long usuarioId, Long pedidoId, String detalle) {
        if (tipo == TipoMovimientoStock.AJUSTE && antes == despues) return;
        movimientos.save(new MovimientoStock(tipo, producto, antes, despues,
            usuarioId, pedidoId, detalle));
    }

    @Transactional(readOnly = true)
    public InventarioResumen resumen(int umbral) {
        if (umbral < 0 || umbral > 100000) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "El umbral debe estar entre 0 y 100000.");
        }
        List<Producto> lista = productos.findAll(Sort.by("codigo"));
        long unidades = lista.stream().mapToLong(Producto::getStock).sum();
        long agotados = lista.stream().filter(p -> p.getStock() == 0).count();
        long bajos = lista.stream().filter(p -> p.getStock() > 0 && p.getStock() <= umbral).count();
        List<Producto> alertas = lista.stream()
            .filter(p -> p.getStock() <= umbral).toList();
        return new InventarioResumen(lista.size(), unidades, agotados, bajos, umbral, alertas);
    }

    @Transactional(readOnly = true)
    public List<MovimientoStock> historial(String codigo) {
        if (codigo == null || codigo.isBlank()) {
            return movimientos.findTop100ByOrderByFechaDescIdDesc();
        }
        return movimientos.findTop100ByCodigoProductoIgnoreCaseOrderByFechaDescIdDesc(
            codigo.trim());
    }
}

