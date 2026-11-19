
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Login from "../pages/Login";
import { iniciarSesion } from "../services/authService";

vi.mock("../services/authService", () => ({
    iniciarSesion: vi.fn()
}));

beforeEach(() => {
    vi.clearAllMocks();
});

function mostrarLogin(onLogin = vi.fn()) {
    render(
        <MemoryRouter initialEntries={["/login"]}>
            <Routes>
                <Route
                    path="/login"
                    element={<Login onLogin={onLogin} />}
                />
                <Route path="/" element={<h1>Inicio</h1>} />
            </Routes>
        </MemoryRouter>
    );
}

function enviarFormulario(correo, contrasena) {
    if (correo !== undefined) {
        fireEvent.change(screen.getByLabelText(/correo electronico/i), {
            target: { value: correo }
        });
    }

    if (contrasena !== undefined) {
        fireEvent.change(screen.getByLabelText(/contrasena/i), {
            target: { value: contrasena }
        });
    }

    fireEvent.submit(
        screen.getByRole("button", {
            name: /iniciar sesion/i
        }).closest("form")
    );
}

describe("Login conectado a Spring Boot", () => {
    it("rechaza campos vacios", () => {
        mostrarLogin();
        enviarFormulario();

        expect(
            screen.getByText(/debes completar correo y contrasena/i)
        ).toBeInTheDocument();

        expect(iniciarSesion).not.toHaveBeenCalled();
    });

    it("muestra error cuando el backend rechaza las credenciales", async () => {
        vi.mocked(iniciarSesion).mockRejectedValue(
            new Error("Correo o contrasena incorrectos.")
        );

        mostrarLogin();
        enviarFormulario("cliente@sonidovivo.cl", "incorrecta");

        expect(
            await screen.findByText(/correo o contrasena incorrectos/i)
        ).toBeInTheDocument();
    });

    it("inicia sesion y redirige al inicio", async () => {
        const usuario = {
            id: 10,
            nombre: "Cliente Prueba",
            correo: "cliente@sonidovivo.cl",
            rol: "CLIENTE",
            activo: true
        };

        vi.mocked(iniciarSesion).mockResolvedValue(usuario);

        const onLogin = vi.fn();
        mostrarLogin(onLogin);

        enviarFormulario("cliente@sonidovivo.cl", "clave12345");

        await waitFor(() => {
            expect(iniciarSesion).toHaveBeenCalledWith(
                "cliente@sonidovivo.cl",
                "clave12345"
            );

            expect(onLogin).toHaveBeenCalledWith(usuario);
        });

        expect(
            await screen.findByRole("heading", { name: "Inicio" })
        ).toBeInTheDocument();
    });

    it("muestra el error cuando Spring Boot no responde", async () => {
        vi.mocked(iniciarSesion).mockRejectedValue(
            new Error("No se pudo conectar con el backend de Sonido Vivo.")
        );

        mostrarLogin();
        enviarFormulario("cliente@sonidovivo.cl", "clave12345");

        expect(
            await screen.findByText(/no se pudo conectar con el backend/i)
        ).toBeInTheDocument();
    });
});
