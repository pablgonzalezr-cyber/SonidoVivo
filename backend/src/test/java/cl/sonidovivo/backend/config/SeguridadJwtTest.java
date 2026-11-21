package cl.sonidovivo.backend.config;

import cl.sonidovivo.backend.model.RolUsuario;
import cl.sonidovivo.backend.model.Usuario;
import cl.sonidovivo.backend.repository.UsuarioRepository;
import java.time.Instant;
import java.util.Base64;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class SeguridadJwtTest {
    @Test
    void validaTamanoMinimoDeLaClaveJwt() {
        SeguridadConfig config = new SeguridadConfig();
        String corta = Base64.getEncoder().encodeToString(new byte[16]);
        assertThrows(IllegalArgumentException.class, () -> config.jwtSecretKey(corta));
        String correcta = Base64.getEncoder().encodeToString(new byte[32]);
        assertNotNull(config.jwtSecretKey(correcta));
    }

    @Test
    void rolesDelJwtProvienenDelUsuarioActualEnBD() {
        UsuarioRepository repository = mock(UsuarioRepository.class);
        Usuario usuario = new Usuario();
        usuario.setActivo(true);
        usuario.setRol(RolUsuario.VENDEDOR);
        when(repository.findById(12L)).thenReturn(Optional.of(usuario));

        JwtAuthenticationConverter converter = new SeguridadConfig()
            .jwtAuthenticationConverter(repository);
        Jwt jwt = new Jwt("token", Instant.now(), Instant.now().plusSeconds(60),
            java.util.Map.of("alg", "HS256"), java.util.Map.of("sub", "12"));

        var autenticacion = converter.convert(jwt);
        assertNotNull(autenticacion);
        assertTrue(autenticacion.getAuthorities().stream()
            .anyMatch(authority -> authority.getAuthority().equals("ROLE_VENDEDOR")));
        assertFalse(autenticacion.getAuthorities().stream()
            .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN")));
    }

    @Test
    void jwtDeCuentaDesactivadaNoRecibeAutoridades() {
        UsuarioRepository repository = mock(UsuarioRepository.class);
        Usuario usuario = new Usuario();
        usuario.setActivo(false);
        when(repository.findById(12L)).thenReturn(Optional.of(usuario));
        JwtAuthenticationConverter converter = new SeguridadConfig()
            .jwtAuthenticationConverter(repository);
        Jwt jwt = new Jwt("token", Instant.now(), Instant.now().plusSeconds(60),
            java.util.Map.of("alg", "HS256"), java.util.Map.of("sub", "12"));
        assertThrows(BadCredentialsException.class, () -> converter.convert(jwt));
    }
}
