package cl.sonidovivo.backend.config;

import cl.sonidovivo.backend.model.Usuario;
import cl.sonidovivo.backend.repository.UsuarioRepository;
import com.nimbusds.jose.jwk.source.ImmutableSecret;
import java.util.Base64;
import java.util.List;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class SeguridadConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecretKey jwtSecretKey(
            @Value("${security.jwt.secret}") String secret) {

        byte[] bytes = Base64.getDecoder().decode(secret);

        if (bytes.length < 32) {
            throw new IllegalArgumentException(
                "JWT_SECRET debe tener al menos 32 bytes."
            );
        }

        return new SecretKeySpec(bytes, "HmacSHA256");
    }

    @Bean
    public JwtEncoder jwtEncoder(SecretKey key) {
        return new NimbusJwtEncoder(new ImmutableSecret<>(key));
    }

    @Bean
    public JwtDecoder jwtDecoder(
            SecretKey key,
            @Value("${security.jwt.issuer}") String issuer) {

        NimbusJwtDecoder decoder = NimbusJwtDecoder
                .withSecretKey(key)
                .macAlgorithm(MacAlgorithm.HS256)
                .build();

        decoder.setJwtValidator(
                JwtValidators.createDefaultWithIssuer(issuer)
        );

        return decoder;
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter(
            UsuarioRepository repository) {

        JwtAuthenticationConverter converter =
                new JwtAuthenticationConverter();

        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            Long id;

            try {
                id = Long.valueOf(jwt.getSubject());
            } catch (NumberFormatException ex) {
                throw new BadCredentialsException("Token invalido");
            }

            Usuario usuario = repository.findById(id)
                    .filter(Usuario::isActivo)
                    .orElseThrow(() ->
                        new BadCredentialsException(
                            "Usuario no autorizado"
                        )
                    );

            return List.<GrantedAuthority>of(
                new SimpleGrantedAuthority(
                    "ROLE_" + usuario.getRol().name()
                )
            );
        });

        return converter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtAuthenticationConverter converter) throws Exception {

        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(Customizer.withDefaults())
            .sessionManagement(session ->
                session.sessionCreationPolicy(
                    SessionCreationPolicy.STATELESS
                )
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/api/salud",
                    "/api/auth/login",
                    "/api/auth/registro",
                    "/swagger-ui.html",
                    "/swagger-ui/**",
                    "/v3/api-docs/**"
                ).permitAll()
                .requestMatchers("/api/auth/admin-prueba")
                    .hasRole("ADMIN")
                .requestMatchers("/api/admin/**")
                    .hasRole("ADMIN")
                .requestMatchers("/api/vendedor/**")
                    .hasAnyRole("ADMIN", "VENDEDOR")
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth ->
                oauth.jwt(jwt ->
                    jwt.jwtAuthenticationConverter(converter)
                )
            );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(
            List.of("http://localhost:5173")
        );

        config.setAllowedMethods(
            List.of("GET", "POST", "PUT", "DELETE", "OPTIONS")
        );

        config.setAllowedHeaders(
            List.of("Authorization", "Content-Type")
        );

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", config);

        return source;
    }
}
