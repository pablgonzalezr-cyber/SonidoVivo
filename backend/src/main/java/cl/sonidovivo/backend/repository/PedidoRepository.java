package cl.sonidovivo.backend.repository;

import cl.sonidovivo.backend.model.Pedido;
import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    List<Pedido> findByUsuario_IdOrderByFechaDesc(Long usuarioId);

    List<Pedido> findAllByOrderByFechaDesc();

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Pedido p WHERE p.id = :id")
    Optional<Pedido> bloquearParaCambioEstado(
        @Param("id") Long id
    );
}
