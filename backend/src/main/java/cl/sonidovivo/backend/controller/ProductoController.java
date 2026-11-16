package cl.sonidovivo.backend.controller;

import cl.sonidovivo.backend.dto.ProductoRequest;
import cl.sonidovivo.backend.model.Producto;
import cl.sonidovivo.backend.service.ProductoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {

    private final ProductoService service;

    public ProductoController(ProductoService service) {
        this.service = service;
    }

    @GetMapping
    public List<Producto> listar() {
        return service.listar();
    }

    @GetMapping("/{codigo}")
    public Producto obtener(@PathVariable String codigo) {
        return service.buscarPorCodigo(codigo);
    }

    @Operation(security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping
    public ResponseEntity<Producto> crear(
            @Valid @RequestBody ProductoRequest datos) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(service.crear(datos));
    }

    @Operation(security = @SecurityRequirement(name = "bearerAuth"))
    @PutMapping("/{codigo}")
    public Producto actualizar(
            @PathVariable String codigo,
            @Valid @RequestBody ProductoRequest datos) {
        return service.actualizar(codigo, datos);
    }

    @Operation(security = @SecurityRequirement(name = "bearerAuth"))
    @DeleteMapping("/{codigo}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable String codigo) {
        service.eliminar(codigo);
    }
}
