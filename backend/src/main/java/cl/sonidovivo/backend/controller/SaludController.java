package cl.sonidovivo.backend.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class SaludController {

    @GetMapping("/salud")
    public Map<String, String> verificarSalud() {
        return Map.of(
            "estado", "ok",
            "mensaje", "Backend Sonido Vivo funcionando correctamente"
        );
    }
}
