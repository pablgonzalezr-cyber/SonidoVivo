package cl.sonidovivo.backend.config;

import cl.sonidovivo.backend.model.RolUsuario;
import cl.sonidovivo.backend.model.Usuario;
import cl.sonidovivo.backend.repository.UsuarioRepository;
import java.util.Locale;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AdministradorInicialConfig {

    @Bean
    public ApplicationRunner crearAdministradorInicial(
            UsuarioRepository repository,
            PasswordEncoder passwordEncoder,
            @Value("${ADMIN_BOOTSTRAP_EMAIL:}") String correo,
            @Value("${ADMIN_BOOTSTRAP_PASSWORD:}") String contrasena) {

        return args -> {

            if (repository.countByRolAndActivoTrue(
                    RolUsuario.ADMIN) > 0) {
                return;
            }

            if (correo.isBlank() && contrasena.isBlank()) {
                return;
            }

            if (
                correo.isBlank() ||
                contrasena.length() < 8 ||
                contrasena.length() > 72
            ) {
                throw new IllegalStateException(
                    "Configura las credenciales iniciales del administrador."
                );
            }

            String correoNormalizado = correo.trim()
                .toLowerCase(Locale.ROOT);

            if (repository.existsByCorreoIgnoreCase(correoNormalizado)) {
                throw new IllegalStateException(
                    "El correo del administrador inicial ya existe."
                );
            }

            Usuario administrador = new Usuario();
            administrador.setNombre(
                "Administrador Sonido Vivo"
            );
            administrador.setCorreo(correoNormalizado);
            administrador.setContrasenaHash(
                passwordEncoder.encode(contrasena)
            );
            administrador.setRol(RolUsuario.ADMIN);
            administrador.setActivo(true);

            repository.saveAndFlush(administrador);
        };
    }
}
