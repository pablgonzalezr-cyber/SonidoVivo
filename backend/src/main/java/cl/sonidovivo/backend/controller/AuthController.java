
package cl.sonidovivo.backend.controller;

import cl.sonidovivo.backend.model.RolUsuario;
import cl.sonidovivo.backend.model.Usuario;
import cl.sonidovivo.backend.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    public record RegistroRequest(
        @NotBlank
        @Size(min = 3, max = 120)
        String nombre,

        @NotBlank
        @Email
        String correo,

        @NotBlank
        @Size(min = 8, max = 72)
        String contrasena
    ) {}

    public record LoginRequest(
        @NotBlank
        String correo,

        @NotBlank
        String contrasena
    ) {}

    public record UsuarioResponse(
        Long id,
        String nombre,
        String correo,
        RolUsuario rol,
        boolean activo
    ) {}

    public record LoginResponse(
        String token,
        String tipo,
        long expiresIn,
        UsuarioResponse usuario
    ) {}

    private UsuarioResponse respuestaUsuario(Usuario usuario) {
        return new UsuarioResponse(
            usuario.getId(),
            usuario.getNombre(),
            usuario.getCorreo(),
            usuario.getRol(),
            usuario.isActivo()
        );
    }

    @PostMapping("/registro")
    public ResponseEntity<UsuarioResponse> registro(
            @Valid @RequestBody RegistroRequest datos) {

        Usuario usuario = authService.registrar(
            datos.nombre(),
            datos.correo(),
            datos.contrasena()
        );

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(respuestaUsuario(usuario));
    }

    @PostMapping("/login")
    public LoginResponse login(
            @Valid @RequestBody LoginRequest datos) {

        Usuario usuario = authService.autenticar(
            datos.correo(),
            datos.contrasena()
        );

        return new LoginResponse(
            authService.generarToken(usuario),
            "Bearer",
            authService.getExpirationSeconds(),
            respuestaUsuario(usuario)
        );
    }

    @Operation(
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @GetMapping("/me")
    public UsuarioResponse miPerfil(
            @AuthenticationPrincipal Jwt jwt) {

        Long id = Long.valueOf(jwt.getSubject());

        return respuestaUsuario(
            authService.obtenerUsuario(id)
        );
    }

    @Operation(
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @GetMapping("/admin-prueba")
    public Map<String, String> pruebaAdmin() {

        return Map.of(
            "mensaje",
            "Acceso autorizado para administrador"
        );
    }
}
