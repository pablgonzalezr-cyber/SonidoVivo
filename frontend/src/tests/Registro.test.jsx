
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import Registro from "../pages/Registro";
import { correoRegistrado, registrarUsuario } from "../services/usuariosService";

vi.mock("../services/usuariosService", () => ({
    correoRegistrado: vi.fn(),
    registrarUsuario: vi.fn()
}));

const datosValidos = {
    nombre: "Cliente Prueba",
    correo: "cliente@ejemplo.cl",
    contrasena: "clave123",
    confirmar: "clave123"
};

beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(correoRegistrado).mockReturnValue(false);
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
        screen.getByRole("button", { name: "Crear cuenta" }).closest("form")
    );
}

describe("Formulario de registro", () => {
    it("rechaza un nombre demasiado corto", () => {
        completarYEnviar({ nombre: "Al" });
        expect(screen.getByText(/al menos 3 caracteres/i)).toBeInTheDocument();
        expect(registrarUsuario).not.toHaveBeenCalled();
    });

    it("rechaza un correo sin formato valido", () => {
        completarYEnviar({ correo: "correo-invalido" });
        expect(screen.getByText(/correo valido/i)).toBeInTheDocument();
        expect(registrarUsuario).not.toHaveBeenCalled();
    });

    it("rechaza contrasenas diferentes", () => {
        completarYEnviar({ confirmar: "otraClave" });
        expect(screen.getByText(/no coinciden/i)).toBeInTheDocument();
        expect(registrarUsuario).not.toHaveBeenCalled();
    });

    it("rechaza un correo registrado", () => {
        vi.mocked(correoRegistrado).mockReturnValue(true);
        completarYEnviar();
        expect(screen.getByText(/ya se encuentra registrado/i)).toBeInTheDocument();
        expect(registrarUsuario).not.toHaveBeenCalled();
    });

    it("registra al cliente con datos validos", () => {
        completarYEnviar();
        expect(registrarUsuario).toHaveBeenCalledWith({
            nombre: "Cliente Prueba",
            correo: "cliente@ejemplo.cl",
            contrasena: "clave123"
        });
        expect(screen.getByText(/registrado correctamente/i)).toBeInTheDocument();
    });
});
