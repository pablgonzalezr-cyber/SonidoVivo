package cl.sonidovivo.backend.controller;

import cl.sonidovivo.backend.model.RolUsuario;
import cl.sonidovivo.backend.model.Usuario;
import cl.sonidovivo.backend.service.UsuarioService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/usuarios")
@PreAuthorize("hasRole('ADMIN')")
@SecurityRequirement(name = "bearerAuth")
public class UsuarioController {

    private final UsuarioService service;

    public UsuarioController(UsuarioService service) {
        this.service = service;
    }

    public record CrearUsuarioRequest(
        @NotBlank
        @Size(min = 3, max = 120)
        String nombre,

        @NotBlank
        @Email
        String correo,

        @NotBlank
        @Size(min = 8, max = 72)
        String contrasena,

        @NotNull
        RolUsuario rol
    ) {}

    public record EditarUsuarioRequest(
        @NotBlank
        @Size(min = 3, max = 120)
        String nombre,

        @NotBlank
        @Email
        String correo,

        @Size(max = 72)
        String contrasena,

        @NotNull
        RolUsuario rol
    ) {}

    public record EstadoRequest(
        @NotNull Boolean activo
    ) {}

    public record UsuarioResponse(
        Long id,
        String nombre,
        String correo,
        RolUsuario rol,
        boolean activo
    ) {}

    private UsuarioResponse respuesta(Usuario usuario) {
        return new UsuarioResponse(
            usuario.getId(),
            usuario.getNombre(),
            usuario.getCorreo(),
            usuario.getRol(),
            usuario.isActivo()
        );
    }

    @GetMapping
    public List<UsuarioResponse> listar() {
        return service.listar()
            .stream()
            .map(this::respuesta)
            .toList();
    }

    @PostMapping
    public ResponseEntity<UsuarioResponse> crear(
            @Valid @RequestBody CrearUsuarioRequest datos) {

        Usuario usuario = service.crear(
            datos.nombre(),
            datos.correo(),
            datos.contrasena(),
            datos.rol()
        );

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(respuesta(usuario));
    }

    @PutMapping("/{id}")
    public UsuarioResponse editar(
            @PathVariable Long id,
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody EditarUsuarioRequest datos) {

        Usuario usuario = service.editar(
            id,
            Long.valueOf(jwt.getSubject()),
            datos.nombre(),
            datos.correo(),
            datos.contrasena(),
            datos.rol()
        );

        return respuesta(usuario);
    }

    @PutMapping("/{id}/estado")
    public UsuarioResponse cambiarEstado(
            @PathVariable Long id,
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody EstadoRequest datos) {

        Usuario usuario = service.cambiarEstado(
            id,
            Long.valueOf(jwt.getSubject()),
            datos.activo()
        );

        return respuesta(usuario);
    }
}
