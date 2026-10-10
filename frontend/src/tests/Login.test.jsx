import {
    beforeEach,
    describe,
    it,
    expect,
    vi
} from "vitest";

import {
    render,
    screen,
    fireEvent
} from "@testing-library/react";

import "@testing-library/jest-dom/vitest";

import { MemoryRouter } from "react-router-dom";

import Login from "../pages/Login";

beforeEach(() => {

    localStorage.clear();

    localStorage.setItem(
        "sonidoVivoUsuarios",
        JSON.stringify([
            {
                id: 1,
                nombre: "Cliente Prueba",
                correo: "cliente@sonidovivo.cl",
                contrasena: "123456",
                rol: "CLIENTE"
            }
        ])
    );

});

describe("Inicio de sesion", () => {

    it("muestra error con campos vacios", () => {

        render(
            <MemoryRouter>
                <Login onLogin={vi.fn()} />
            </MemoryRouter>
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: /iniciar sesion/i
            })
        );

        expect(
            screen.getByText(
                /debes completar correo y contrasena/i
            )
        ).toBeInTheDocument();

    });

    it("rechaza credenciales incorrectas", () => {

        render(
            <MemoryRouter>
                <Login onLogin={vi.fn()} />
            </MemoryRouter>
        );

        fireEvent.change(
            screen.getByLabelText(/correo electronico/i),
            {
                target: {
                    value: "cliente@sonidovivo.cl"
                }
            }
        );

        fireEvent.change(
            screen.getByLabelText(/contrasena/i),
            {
                target: {
                    value: "incorrecta"
                }
            }
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: /iniciar sesion/i
            })
        );

        expect(
            screen.getByText(
                /correo o contrasena incorrectos/i
            )
        ).toBeInTheDocument();

    });

    it("permite iniciar sesion correctamente", () => {

        const onLogin = vi.fn();

        render(
            <MemoryRouter>
                <Login onLogin={onLogin} />
            </MemoryRouter>
        );

        fireEvent.change(
            screen.getByLabelText(/correo electronico/i),
            {
                target: {
                    value: "cliente@sonidovivo.cl"
                }
            }
        );

        fireEvent.change(
            screen.getByLabelText(/contrasena/i),
            {
                target: {
                    value: "123456"
                }
            }
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: /iniciar sesion/i
            })
        );

        expect(onLogin).toHaveBeenCalledTimes(1);

        expect(onLogin).toHaveBeenCalledWith(
            expect.objectContaining({
                correo: "cliente@sonidovivo.cl",
                rol: "CLIENTE"
            })
        );

    });

});
