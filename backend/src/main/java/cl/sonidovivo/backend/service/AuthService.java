
package cl.sonidovivo.backend.service;

import cl.sonidovivo.backend.model.RolUsuario;
import cl.sonidovivo.backend.model.Usuario;
import cl.sonidovivo.backend.repository.UsuarioRepository;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Locale;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final UsuarioRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtEncoder jwtEncoder;
    private final String issuer;
    private final long expirationMinutes;

    public AuthService(
            UsuarioRepository repository,
            PasswordEncoder passwordEncoder,
            JwtEncoder jwtEncoder,
            @Value("${security.jwt.issuer}") String issuer,
            @Value("${security.jwt.expiration-minutes}")
                long expirationMinutes) {

        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.jwtEncoder = jwtEncoder;
        this.issuer = issuer;
        this.expirationMinutes = expirationMinutes;
    }

    public Usuario registrar(
            String nombre,
            String correo,
            String contrasena) {

        String nombreLimpio = nombre.trim();
        String correoLimpio = correo.trim()
                .toLowerCase(Locale.ROOT);

        if (nombreLimpio.length() < 3) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "El nombre debe tener al menos 3 caracteres."
            );
        }

        if (repository.existsByCorreoIgnoreCase(correoLimpio)) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "El correo ya esta registrado."
            );
        }

        Usuario usuario = new Usuario();
        usuario.setNombre(nombreLimpio);
        usuario.setCorreo(correoLimpio);
        usuario.setContrasenaHash(
            passwordEncoder.encode(contrasena)
        );
        usuario.setRol(RolUsuario.CLIENTE);
        usuario.setActivo(true);

        try {
            return repository.saveAndFlush(usuario);
        } catch (DataIntegrityViolationException ex) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "No se pudo registrar el correo."
            );
        }
    }

    public Usuario autenticar(
            String correo,
            String contrasena) {

        String correoLimpio = correo.trim()
                .toLowerCase(Locale.ROOT);

        Usuario usuario = repository
            .findByCorreoIgnoreCase(correoLimpio)
            .filter(Usuario::isActivo)
            .orElseThrow(() ->
                new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Credenciales incorrectas."
                )
            );

        if (!passwordEncoder.matches(
                contrasena,
                usuario.getContrasenaHash())) {

            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Credenciales incorrectas."
            );
        }

        return usuario;
    }

    public String generarToken(Usuario usuario) {

        Instant ahora = Instant.now();
        Instant expiracion = ahora.plus(
            expirationMinutes,
            ChronoUnit.MINUTES
        );

        JwtClaimsSet claims = JwtClaimsSet.builder()
            .issuer(issuer)
            .issuedAt(ahora)
            .expiresAt(expiracion)
            .subject(usuario.getId().toString())
            .claim("rol", usuario.getRol().name())
            .build();

        JwsHeader header = JwsHeader
            .with(MacAlgorithm.HS256)
            .build();

        return jwtEncoder.encode(
            JwtEncoderParameters.from(header, claims)
        ).getTokenValue();
    }

    public long getExpirationSeconds() {
        return expirationMinutes * 60;
    }

    public Usuario obtenerUsuario(Long id) {
        return repository.findById(id)
            .filter(Usuario::isActivo)
            .orElseThrow(() ->
                new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Sesion no valida."
                )
            );
    }
}
