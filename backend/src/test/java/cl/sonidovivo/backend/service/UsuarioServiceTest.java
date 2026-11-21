package cl.sonidovivo.backend.service;

import cl.sonidovivo.backend.model.RolUsuario;
import cl.sonidovivo.backend.model.Usuario;
import cl.sonidovivo.backend.repository.UsuarioRepository;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class UsuarioServiceTest {
    private UsuarioRepository repository;
    private PasswordEncoder encoder;
    private UsuarioService service;

    @BeforeEach
    void preparar() {
        repository = mock(UsuarioRepository.class);
        encoder = mock(PasswordEncoder.class);
        service = new UsuarioService(repository, encoder);
    }

    @Test
    void creaVendedorConPasswordHasheada() {
        when(encoder.encode("clave12345")).thenReturn("HASH");
        when(repository.saveAndFlush(any(Usuario.class))).thenAnswer(inv -> inv.getArgument(0));
        Usuario creado = service.crear("Vendedor", "VENDEDOR@EJEMPLO.CL", "clave12345", RolUsuario.VENDEDOR);
        assertEquals(RolUsuario.VENDEDOR, creado.getRol());
        assertEquals("vendedor@ejemplo.cl", creado.getCorreo());
        assertEquals("HASH", creado.getContrasenaHash());
    }

    @Test
    void noPermiteEditarPropiaCuentaAdministrativa() {
        ResponseStatusException error = assertThrows(ResponseStatusException.class,
            () -> service.editar(3L, 3L, "Admin", "admin@ejemplo.cl", "", RolUsuario.ADMIN));
        assertEquals(HttpStatus.FORBIDDEN, error.getStatusCode());
        verifyNoInteractions(repository);
    }

    @Test
    void noPermiteDesactivarCuentaPropia() {
        ResponseStatusException error = assertThrows(ResponseStatusException.class,
            () -> service.cambiarEstado(3L, 3L, false));
        assertEquals(HttpStatus.FORBIDDEN, error.getStatusCode());
    }

    @Test
    void mantieneUltimoAdminActivo() {
        Usuario administrador = new Usuario();
        administrador.setRol(RolUsuario.ADMIN);
        administrador.setActivo(true);
        when(repository.findById(4L)).thenReturn(Optional.of(administrador));
        when(repository.countByRolAndActivoTrue(RolUsuario.ADMIN)).thenReturn(1L);
        ResponseStatusException error = assertThrows(ResponseStatusException.class,
            () -> service.cambiarEstado(4L, 3L, false));
        assertEquals(HttpStatus.CONFLICT, error.getStatusCode());
        assertTrue(administrador.isActivo());
    }

    @Test
    void permiteReactivarCuentaAjena() {
        Usuario usuario = new Usuario();
        usuario.setActivo(false);
        usuario.setRol(RolUsuario.CLIENTE);
        when(repository.findById(8L)).thenReturn(Optional.of(usuario));
        when(repository.saveAndFlush(usuario)).thenReturn(usuario);
        Usuario actualizado = service.cambiarEstado(8L, 3L, true);
        assertTrue(actualizado.isActivo());
    }
}
