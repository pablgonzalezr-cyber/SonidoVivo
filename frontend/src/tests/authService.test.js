
import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    vi
} from "vitest";

import {
    iniciarSesion,
    registrarCuenta,
    recuperarSesion,
    obtenerSesion,
    obtenerToken,
    cerrarSesion
} from "../services/authService";

import { migrarCarritoInvitado } from "../services/carritoService";

vi.mock("../services/carritoService", () => ({
    migrarCarritoInvitado: vi.fn()
}));

const usuario = {
    id: 20,
    nombre: "Cliente Prueba",
    correo: "cliente@sonidovivo.cl",
    rol: "CLIENTE",
    activo: true
};

function simularRespuesta(datos, estado = 200) {
    const fetchMock = vi.fn().mockResolvedValue({
        ok: estado >= 200 && estado < 300,
        status: estado,
        json: async () => datos
    });

    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
}

beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
});

afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
});

describe("Autenticacion JWT", () => {
    it("registra clientes usando el backend", async () => {
        const fetchMock = simularRespuesta(usuario, 201);

        await registrarCuenta({
            nombre: usuario.nombre,
            correo: usuario.correo,
            contrasena: "clave1234"
        });

        const [url, opciones] = fetchMock.mock.calls[0];

        expect(url).toContain("/api/auth/registro");
        expect(opciones.method).toBe("POST");
    });

    it("guarda el JWT al iniciar sesion", async () => {
        simularRespuesta({
            token: "jwt-valido-de-prueba",
            usuario
        });

        const resultado = await iniciarSesion(
            "cliente@sonidovivo.cl",
            "clave1234"
        );

        expect(resultado).toEqual(usuario);
        expect(obtenerToken()).toBe("jwt-valido-de-prueba");
        expect(obtenerSesion()).toEqual(usuario);
        expect(migrarCarritoInvitado).toHaveBeenCalledWith(20);
    });

    it("rechaza credenciales incorrectas", async () => {
        simularRespuesta(null, 401);

        await expect(
            iniciarSesion("cliente@sonidovivo.cl", "incorrecta")
        ).rejects.toThrow(/correo o contrasena incorrectos/i);

        expect(obtenerToken()).toBeNull();
    });

    it("recupera una sesion consultando el perfil", async () => {
        localStorage.setItem("sonidoVivoJwt", "jwt-guardado");

        const fetchMock = simularRespuesta(usuario);

        const resultado = await recuperarSesion();

        expect(resultado).toEqual(usuario);
        expect(obtenerSesion()).toEqual(usuario);

        const opciones = fetchMock.mock.calls[0][1];

        expect(opciones.headers.Authorization).toBe(
            "Bearer jwt-guardado"
        );
    });

    it("elimina una sesion rechazada por el backend", async () => {
        localStorage.setItem("sonidoVivoJwt", "jwt-vencido");
        localStorage.setItem(
            "sonidoVivoSesion",
            JSON.stringify(usuario)
        );

        simularRespuesta(null, 401);

        const resultado = await recuperarSesion();

        expect(resultado).toBeNull();
        expect(obtenerToken()).toBeNull();
        expect(obtenerSesion()).toBeNull();
    });

    it("no recupera sesion si no existe token", async () => {
        const resultado = await recuperarSesion();

        expect(resultado).toBeNull();
    });

    it("elimina el token y la sesion al cerrar", () => {
        localStorage.setItem("sonidoVivoJwt", "jwt-prueba");
        localStorage.setItem(
            "sonidoVivoSesion",
            JSON.stringify(usuario)
        );

        cerrarSesion();

        expect(obtenerToken()).toBeNull();
        expect(obtenerSesion()).toBeNull();
    });
});
