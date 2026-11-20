package cl.sonidovivo.backend.controller;

import cl.sonidovivo.backend.dto.PedidoRequest;
import cl.sonidovivo.backend.dto.PedidoResponse;
import cl.sonidovivo.backend.model.EstadoPedido;
import cl.sonidovivo.backend.service.PedidoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/pedidos")
@SecurityRequirement(name = "bearerAuth")
public class PedidoController {

    private final PedidoService service;

    public PedidoController(PedidoService service) {
        this.service = service;
    }

    public record EstadoRequest(
        @NotNull EstadoPedido estado
    ) {
    }

    @Operation(summary = "Confirmar compra de un cliente")
    @PreAuthorize("hasRole('CLIENTE')")
    @PostMapping
    public ResponseEntity<PedidoResponse> crear(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody PedidoRequest datos) {

        PedidoResponse pedido = service.crear(
            Long.valueOf(jwt.getSubject()),
            datos
        );

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(pedido);
    }

    @Operation(summary = "Consultar mis pedidos")
    @PreAuthorize("hasRole('CLIENTE')")
    @GetMapping("/mis")
    public List<PedidoResponse> misPedidos(
            @AuthenticationPrincipal Jwt jwt) {

        return service.obtenerMisPedidos(
            Long.valueOf(jwt.getSubject())
        );
    }

    @Operation(summary = "Listar todos los pedidos")
    @PreAuthorize("hasAnyRole('ADMIN', 'VENDEDOR')")
    @GetMapping
    public List<PedidoResponse> listarTodos() {
        return service.listarTodos();
    }

    @Operation(summary = "Actualizar estado de un pedido")
    @PreAuthorize("hasAnyRole('ADMIN', 'VENDEDOR')")
    @PutMapping("/{id}/estado")
    public PedidoResponse actualizarEstado(
            @PathVariable Long id,
            @Valid @RequestBody EstadoRequest datos) {

        return service.cambiarEstado(
            id,
            datos.estado()
        );
    }
}
