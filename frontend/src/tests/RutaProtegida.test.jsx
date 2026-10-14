
import {
    describe,
    it,
    expect
} from "vitest";

import {
    render,
    screen
} from "@testing-library/react";

import "@testing-library/jest-dom/vitest";

import {
    MemoryRouter,
    Routes,
    Route
} from "react-router-dom";

import RutaProtegida from "../components/RutaProtegida";

function mostrarRuta(sesion, rolesPermitidos) {

    render(
        <MemoryRouter initialEntries={["/privado"]}>
            <Routes>

                <Route
                    path="/privado"
                    element={
                        <RutaProtegida
                            sesion={sesion}
                            rolesPermitidos={rolesPermitidos}
                        >
                            <h1>Contenido privado</h1>
                        </RutaProtegida>
                    }
                />

                <Route
                    path="/login"
                    element={<h1>Iniciar sesión</h1>}
                />

                <Route
                    path="/"
                    element={<h1>Página de inicio</h1>}
                />

            </Routes>
        </MemoryRouter>
    );

}

describe("Protección de rutas", () => {

    it("redirige al login si no hay sesión", () => {

        mostrarRuta(null, ["ADMIN"]);

        expect(
            screen.getByText("Iniciar sesión")
        ).toBeInTheDocument();

    });

    it("rechaza a un cliente en una ruta administrativa", () => {

        mostrarRuta(
            { id: 1, rol: "CLIENTE" },
            ["ADMIN"]
        );

        expect(
            screen.getByText("Página de inicio")
        ).toBeInTheDocument();

    });

    it("permite el acceso del administrador", () => {

        mostrarRuta(
            { id: 2, rol: "ADMIN" },
            ["ADMIN"]
        );

        expect(
            screen.getByText("Contenido privado")
        ).toBeInTheDocument();

    });

    it("permite al vendedor acceder a sus rutas", () => {

        mostrarRuta(
            { id: 3, rol: "VENDEDOR" },
            ["ADMIN", "VENDEDOR"]
        );

        expect(
            screen.getByText("Contenido privado")
        ).toBeInTheDocument();

    });

});
