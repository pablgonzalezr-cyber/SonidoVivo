package cl.sonidovivo.backend.config;

import cl.sonidovivo.backend.model.Producto;
import cl.sonidovivo.backend.repository.ProductoRepository;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DatosInicialesProducto {

    @Bean
    public CommandLineRunner cargarProductosIniciales(ProductoRepository repository) {
        return args -> {
            if (repository.count() != 0) {
                return;
            }

            repository.saveAll(List.of(
                new Producto("GA001", "Guitarras Acústicas", "Guitarra Acústica Folk", "Yamaha", "F310", 8, 129990, "Tapa de abeto, aros y fondo de meranti. Ideal para iniciantes."),
                new Producto("GE001", "Guitarras Eléctricas", "Guitarra Eléctrica Stratocaster", "Squier", "Affinity Strat", 5, 249990, "Cuerpo de álamo, mástil de arce, pastillas SSS."),
                new Producto("BA001", "Bajos Eléctricos", "Bajo Eléctrico 4 Cuerdas", "Squier", "Affinity PJ", 5, 299990, "Pickup PJ, cuerpo álamo, mástil arce."),
                new Producto("BT001", "Baterías", "Batería Acústica 5 piezas", "Pearl", "Roadshow", 2, 599990, "Incluye stands, platillos y pedal de bombo."),
                new Producto("TC001", "Teclados y Pianos", "Teclado Digital 61 teclas", "Yamaha", "PSR-E373", 4, 249990, "61 teclas sensibles al tacto, 622 voces."),
                new Producto("MI001", "Micrófonos", "Micrófono Dinámico Cardioide", "Shure", "SM58", 8, 149990, "Estándar industria para voz en vivo."),
                new Producto("AM001", "Amplificadores", "Amplificador de práctica 20 W", "Sonido Vivo Demo", "Practice 20", 4, 89990, "Producto de demostración de amplificadores para el proyecto académico."),
                new Producto("PE001", "Pedales de Efectos", "Pedal de efectos para guitarra", "Sonido Vivo Demo", "Drive One", 6, 59990, "Pedal de demostración para ampliar las categorías del catálogo."),
                new Producto("AC001", "Accesorios", "Set de accesorios para guitarra", "Sonido Vivo Demo", "Accesorios 3 en 1", 12, 19990, "Artículo de muestra para ilustrar la categoría de accesorios.")
            ));
        };
    }
}
