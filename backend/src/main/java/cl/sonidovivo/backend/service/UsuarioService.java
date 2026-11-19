package cl.sonidovivo.backend.service;

import cl.sonidovivo.backend.model.RolUsuario;
import cl.sonidovivo.backend.model.Usuario;
import cl.sonidovivo.backend.repository.UsuarioRepository;
import java.util.List;
import java.util.Locale;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UsuarioService {

    private final UsuarioRepository repository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(
            UsuarioRepository repository,
            PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<Usuario> listar() {
        return repository.findAll();
    }

    @Transactional
    public Usuario crear(
            String nombre,
            String correo,
            String contrasena,
            RolUsuario rol) {

        String correoNormalizado = normalizarCorreo(correo);

        if (repository.existsByCorreoIgnoreCase(correoNormalizado)) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "El correo ya esta registrado."
            );
        }

        Usuario usuario = new Usuario();
        usuario.setNombre(nombre.trim());
        usuario.setCorreo(correoNormalizado);
        usuario.setContrasenaHash(
            passwordEncoder.encode(contrasena)
        );
        usuario.setRol(rol);
        usuario.setActivo(true);

        return guardar(usuario);
    }

    @Transactional
    public Usuario editar(
            Long id,
            Long administradorId,
            String nombre,
            String correo,
            String contrasena,
            RolUsuario rol) {

        if (id.equals(administradorId)) {
            throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "No puedes modificar tu propia cuenta."
            );
        }

        Usuario usuario = buscar(id);
        String correoNormalizado = normalizarCorreo(correo);

        repository.findByCorreoIgnoreCase(correoNormalizado)
            .filter(encontrado ->
                !encontrado.getId().equals(id)
            )
            .ifPresent(encontrado -> {
                throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "El correo ya esta registrado."
                );
            });

        if (
            usuario.getRol() == RolUsuario.ADMIN &&
            usuario.isActivo() &&
            rol != RolUsuario.ADMIN &&
            repository.countByRolAndActivoTrue(
                RolUsuario.ADMIN
            ) <= 1
        ) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Debe existir al menos un administrador activo."
            );
        }

        usuario.setNombre(nombre.trim());
        usuario.setCorreo(correoNormalizado);
        usuario.setRol(rol);

        if (contrasena != null && !contrasena.isEmpty()) {
            if (contrasena.isBlank()) {
                throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La contrasena no puede contener solo espacios."
                );
            }

            usuario.setContrasenaHash(
                passwordEncoder.encode(contrasena)
            );
        }

        return guardar(usuario);
    }

    @Transactional
    public Usuario cambiarEstado(
            Long id,
            Long administradorId,
            boolean activo) {

        if (id.equals(administradorId)) {
            throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "No puedes cambiar el estado de tu propia cuenta."
            );
        }

        Usuario usuario = buscar(id);

        if (
            usuario.getRol() == RolUsuario.ADMIN &&
            usuario.isActivo() &&
            !activo &&
            repository.countByRolAndActivoTrue(
                RolUsuario.ADMIN
            ) <= 1
        ) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "No puedes desactivar al ultimo administrador."
            );
        }

        usuario.setActivo(activo);
        return guardar(usuario);
    }

    private Usuario buscar(Long id) {
        return repository.findById(id).orElseThrow(() ->
            new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "El usuario no existe."
            )
        );
    }

    private String normalizarCorreo(String correo) {
        return correo.trim().toLowerCase(Locale.ROOT);
    }

    private Usuario guardar(Usuario usuario) {
        try {
            return repository.saveAndFlush(usuario);
        } catch (DataIntegrityViolationException error) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "No fue posible guardar el usuario."
            );
        }
    }
}
