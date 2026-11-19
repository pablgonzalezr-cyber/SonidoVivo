import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import Registro from "../pages/Registro";
import { registrarCuenta } from "../services/authService";

vi.mock("../services/authService", () => ({
    registrarCuenta: vi.fn()
}));

const datosValidos = {
    nombre: "Cliente Prueba",
    correo: "cliente@ejemplo.cl",
    contrasena: "clave1234",
    confirmar: "clave1234"
};

beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(registrarCuenta).mockResolvedValue({
        id: 12,
        nombre: "Cliente Prueba",
        correo: "cliente@ejemplo.cl",
        rol: "CLIENTE",
        activo: true
    });
});

function completarYEnviar(cambios = {}) {
    const datos = { ...datosValidos, ...cambios };

    render(<Registro />);

    fireEvent.change(screen.getByLabelText("Nombre"), {
        target: { value: datos.nombre }
    });

    fireEvent.change(screen.getByLabelText("Correo electronico"), {
        target: { value: datos.correo }
    });

    fireEvent.change(screen.getByLabelText("Contrasena"), {
        target: { value: datos.contrasena }
    });

    fireEvent.change(screen.getByLabelText("Confirmar contrasena"), {
        target: { value: datos.confirmar }
    });

    fireEvent.submit(
        screen.getByRole("button", {
            name: "Crear cuenta"
        }).closest("form")
    );
}

describe("Registro conectado a Spring Boot", () => {
    it("rechaza nombres demasiado cortos", () => {
        completarYEnviar({ nombre: "Al" });

        expect(
            screen.getByText(/al menos 3 caracteres/i)
        ).toBeInTheDocument();

        expect(registrarCuenta).not.toHaveBeenCalled();
    });

    it("rechaza correos invalidos", () => {
        completarYEnviar({ correo: "correo-invalido" });

        expect(
            screen.getByText(/correo valido/i)
        ).toBeInTheDocument();

        expect(registrarCuenta).not.toHaveBeenCalled();
    });

    it("rechaza contrasenas menores a 8 caracteres", () => {
        completarYEnviar({
            contrasena: "1234567",
            confirmar: "1234567"
        });

        expect(
            screen.getByText(/al menos 8 caracteres/i)
        ).toBeInTheDocument();

        expect(registrarCuenta).not.toHaveBeenCalled();
    });

    it("rechaza contrasenas diferentes", () => {
        completarYEnviar({ confirmar: "otraClave" });

        expect(
            screen.getByText(/no coinciden/i)
        ).toBeInTheDocument();

        expect(registrarCuenta).not.toHaveBeenCalled();
    });

    it("muestra el error de correo duplicado del backend", async () => {
        vi.mocked(registrarCuenta).mockRejectedValue(
            new Error("El correo ya se encuentra registrado.")
        );

        completarYEnviar();

        expect(
            await screen.findByText(/ya se encuentra registrado/i)
        ).toBeInTheDocument();
    });

    it("registra un cliente mediante la API", async () => {
        completarYEnviar();

        await waitFor(() => {
            expect(registrarCuenta).toHaveBeenCalledWith({
                nombre: "Cliente Prueba",
                correo: "cliente@ejemplo.cl",
                contrasena: "clave1234"
            });
        });

        expect(
            await screen.findByText(/registrado correctamente/i)
        ).toBeInTheDocument();
    });
});
