package cl.sonidovivo.backend.controller;

import cl.sonidovivo.backend.dto.InventarioResumen;
import cl.sonidovivo.backend.model.MovimientoStock;
import cl.sonidovivo.backend.service.InventarioService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/vendedor/inventario")
@PreAuthorize("hasAnyRole('ADMIN', 'VENDEDOR')")
@SecurityRequirement(name = "bearerAuth")
public class InventarioController {
    private final InventarioService service;

    public InventarioController(InventarioService service) {
        this.service = service;
    }

    @GetMapping("/resumen")
    public InventarioResumen resumen(@RequestParam(defaultValue = "5") int umbral) {
        return service.resumen(umbral);
    }

    @GetMapping("/movimientos")
    public List<MovimientoStock> movimientos(@RequestParam(required = false) String codigo) {
        return service.historial(codigo);
    }
}
