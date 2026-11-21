package cl.sonidovivo.backend.service;

import cl.sonidovivo.backend.model.RolUsuario;
import cl.sonidovivo.backend.model.Usuario;
import cl.sonidovivo.backend.repository.UsuarioRepository;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class AuthServiceTest {
    private UsuarioRepository repository;
    private PasswordEncoder passwordEncoder;
    private JwtEncoder jwtEncoder;
    private AuthService service;

    @BeforeEach
    void preparar() {
        repository = mock(UsuarioRepository.class);
        passwordEncoder = mock(PasswordEncoder.class);
        jwtEncoder = mock(JwtEncoder.class);
        service = new AuthService(repository, passwordEncoder, jwtEncoder, "sonido-vivo-backend", 60);
    }

    private Usuario usuarioActivo() {
        Usuario usuario = new Usuario();
        usuario.setNombre("Cliente");
        usuario.setCorreo("cliente@ejemplo.cl");
        usuario.setContrasenaHash("HASH");
        usuario.setRol(RolUsuario.CLIENTE);
        usuario.setActivo(true);
        return usuario;
    }

    @Test
    void registroNormalizaCorreoYCreaSoloClientes() {
        when(passwordEncoder.encode("clave12345")).thenReturn("HASH");
        when(repository.saveAndFlush(any(Usuario.class))).thenAnswer(inv -> inv.getArgument(0));
        Usuario creado = service.registrar("  Cliente Uno  ", "  CLIENTE@EJEMPLO.CL  ", "clave12345");
        assertEquals("Cliente Uno", creado.getNombre());
        assertEquals("cliente@ejemplo.cl", creado.getCorreo());
        assertEquals(RolUsuario.CLIENTE, creado.getRol());
        assertTrue(creado.isActivo());
        assertEquals("HASH", creado.getContrasenaHash());
        verify(repository).existsByCorreoIgnoreCase("cliente@ejemplo.cl");
    }

    @Test
    void registroRechazaCorreoDuplicado() {
        when(repository.existsByCorreoIgnoreCase("cliente@ejemplo.cl")).thenReturn(true);
        ResponseStatusException error = assertThrows(ResponseStatusException.class,
            () -> service.registrar("Cliente Uno", "cliente@ejemplo.cl", "clave12345"));
        assertEquals(HttpStatus.CONFLICT, error.getStatusCode());
        verify(repository, never()).saveAndFlush(any());
    }

    @Test
    void registroRechazaNombreCorto() {
        ResponseStatusException error = assertThrows(ResponseStatusException.class,
            () -> service.registrar("Al", "cliente@ejemplo.cl", "clave12345"));
        assertEquals(HttpStatus.BAD_REQUEST, error.getStatusCode());
    }

    @Test
    void loginValidoUsaHashYCambiaMayusculasDelCorreo() {
        Usuario usuario = usuarioActivo();
        when(repository.findByCorreoIgnoreCase("cliente@ejemplo.cl")).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches("clave12345", "HASH")).thenReturn(true);
        assertSame(usuario, service.autenticar("CLIENTE@EJEMPLO.CL", "clave12345"));
    }

    @Test
    void loginConClaveIncorrectaResponde401() {
        when(repository.findByCorreoIgnoreCase("cliente@ejemplo.cl"))
            .thenReturn(Optional.of(usuarioActivo()));
        ResponseStatusException error = assertThrows(ResponseStatusException.class,
            () -> service.autenticar("cliente@ejemplo.cl", "incorrecta"));
        assertEquals(HttpStatus.UNAUTHORIZED, error.getStatusCode());
    }

    @Test
    void loginInactivoResponde401SinVerificarPassword() {
        Usuario usuario = usuarioActivo();
        usuario.setActivo(false);
        when(repository.findByCorreoIgnoreCase("cliente@ejemplo.cl"))
            .thenReturn(Optional.of(usuario));
        ResponseStatusException error = assertThrows(ResponseStatusException.class,
            () -> service.autenticar("cliente@ejemplo.cl", "clave12345"));
        assertEquals(HttpStatus.UNAUTHORIZED, error.getStatusCode());
        verifyNoInteractions(passwordEncoder);
    }

    @Test
    void sesionDeUsuarioInactivoSeRechaza() {
        Usuario usuario = usuarioActivo();
        usuario.setActivo(false);
        when(repository.findById(7L)).thenReturn(Optional.of(usuario));
        ResponseStatusException error = assertThrows(ResponseStatusException.class,
            () -> service.obtenerUsuario(7L));
        assertEquals(HttpStatus.UNAUTHORIZED, error.getStatusCode());
    }

    @Test
    void expiracionSeExpresaEnSegundos() {
        assertEquals(3600L, service.getExpirationSeconds());
    }
}
