package cl.sonidovivo.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record ProductoRequest(
    @NotBlank
    @Pattern(regexp = "[A-Za-z0-9-]{2,20}")
    String codigo,

    @NotBlank
    @Size(max = 100)
    String categoria,

    @NotBlank
    @Size(max = 160)
    String nombre,

    @NotBlank
    @Size(max = 100)
    String marca,

    @NotBlank
    @Size(max = 100)
    String modelo,

    @NotNull
    @PositiveOrZero
    Integer stock,

    @NotNull
    @Positive
    Integer precio,

    @Size(max = 2000)
    String descripcion,

    @Size(max = 255)
    String imagen
) {
}
