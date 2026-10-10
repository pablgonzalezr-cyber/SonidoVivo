
import { describe, it, expect } from "vitest";

import {
    validarNombre,
    validarCorreo,
    validarMensaje,
    validarContrasena,
    validarConfirmacionContrasena
} from "../utils/validaciones";

describe("Validaciones de formularios", () => {

    it("valida correctamente los nombres", () => {

        expect(validarNombre("Pablo")).toBe(true);
        expect(validarNombre("AB")).toBe(false);

    });

    it("valida los correos electronicos", () => {

        expect(validarCorreo("cliente@gmail.com")).toBe(true);
        expect(validarCorreo("correoincorrecto")).toBe(false);

    });

    it("valida la longitud de los mensajes", () => {

        expect(
            validarMensaje("Quiero consultar por una guitarra")
        ).toBe(true);

        expect(validarMensaje("Hola")).toBe(false);

    });

    it("valida las contrasenas", () => {

        expect(validarContrasena("123456")).toBe(true);
        expect(validarContrasena("123")).toBe(false);

    });

    it("comprueba la confirmacion de contrasena", () => {

        expect(
            validarConfirmacionContrasena("123456", "123456")
        ).toBe(true);

        expect(
            validarConfirmacionContrasena("123456", "654321")
        ).toBe(false);

    });

});
