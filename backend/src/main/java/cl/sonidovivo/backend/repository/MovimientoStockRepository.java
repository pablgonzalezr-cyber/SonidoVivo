package cl.sonidovivo.backend.repository;

import cl.sonidovivo.backend.model.MovimientoStock;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MovimientoStockRepository extends JpaRepository<MovimientoStock, Long> {
    List<MovimientoStock> findTop100ByOrderByFechaDescIdDesc();
    List<MovimientoStock> findTop100ByCodigoProductoIgnoreCaseOrderByFechaDescIdDesc(String codigo);
}
