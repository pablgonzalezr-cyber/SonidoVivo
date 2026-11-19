import { describe, expect, it } from "vitest";

import {
    validarNombre,
    validarCorreo,
    validarMensaje,
    validarContrasena,
    validarConfirmacionContrasena
} from "../utils/validaciones";

describe("Validaciones de formularios", () => {
    it("valida nombres", () => {
        expect(validarNombre("Pablo")).toBe(true);
        expect(validarNombre("AB")).toBe(false);
    });

    it("valida correos electronicos", () => {
        expect(validarCorreo("cliente@gmail.com")).toBe(true);
        expect(validarCorreo("correo-invalido")).toBe(false);
    });

    it("valida mensajes", () => {
        expect(
            validarMensaje("Quiero consultar por una guitarra")
        ).toBe(true);

        expect(validarMensaje("Hola")).toBe(false);
    });

    it("exige contrasenas entre 8 y 72 caracteres", () => {
        expect(validarContrasena("1234567")).toBe(false);
        expect(validarContrasena("12345678")).toBe(true);
        expect(validarContrasena("a".repeat(72))).toBe(true);
        expect(validarContrasena("a".repeat(73))).toBe(false);
    });

    it("comprueba la confirmacion de contrasena", () => {
        expect(
            validarConfirmacionContrasena("clave1234", "clave1234")
        ).toBe(true);

        expect(
            validarConfirmacionContrasena("clave1234", "otraClave")
        ).toBe(false);
    });
});
