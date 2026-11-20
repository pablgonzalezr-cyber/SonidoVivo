package cl.sonidovivo.backend.repository;

import cl.sonidovivo.backend.model.Producto;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductoRepository extends JpaRepository<Producto, Long> {

    Optional<Producto> findByCodigoIgnoreCase(String codigo);

    boolean existsByCodigoIgnoreCase(String codigo);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        SELECT p FROM Producto p
        WHERE UPPER(p.codigo) = UPPER(:codigo)
        """)
    Optional<Producto> bloquearParaCompra(
        @Param("codigo") String codigo
    );
}
