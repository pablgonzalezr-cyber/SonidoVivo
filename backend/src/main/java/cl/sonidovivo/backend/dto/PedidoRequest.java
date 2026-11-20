package cl.sonidovivo.backend.dto;

import cl.sonidovivo.backend.model.TipoEntrega;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.util.List;

public record PedidoRequest(
    @NotNull
    TipoEntrega tipoEntrega,

    @Size(max = 255)
    String direccion,

    @NotEmpty
    @Size(max = 30)
    List<@Valid Item> productos
) {
    public record Item(
        @NotBlank
        @Pattern(regexp = "[A-Za-z0-9-]{2,20}")
        String codigo,

        @NotNull
        @Min(1)
        @Max(100)
        Integer cantidad,

        @NotNull
        @Positive
        Integer precioEsperado
    ) {
    }
}
