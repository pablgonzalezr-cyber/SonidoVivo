import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    vi
} from "vitest";

import { obtenerToken } from "../services/authService";

import {
    listarUsuariosApi,
    crearUsuarioApi,
    actualizarUsuarioApi,
    cambiarEstadoUsuarioApi
} from "../services/usuariosApi";

vi.mock("../services/authService", () => ({
    obtenerToken: vi.fn()
}));

const usuario = {
    id: 5,
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
    vi.clearAllMocks();
    vi.mocked(obtenerToken).mockReturnValue("jwt-de-prueba");
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe("API administrativa de usuarios", () => {
    it("lista usuarios enviando el JWT", async () => {
        const fetchMock = simularRespuesta([usuario]);

        const resultado = await listarUsuariosApi();

        expect(resultado).toEqual([usuario]);

        expect(fetchMock).toHaveBeenCalledWith(
            "http://localhost:8080/api/admin/usuarios",
            expect.objectContaining({
                method: "GET",
                headers: expect.objectContaining({
                    Authorization: "Bearer jwt-de-prueba"
                })
            })
        );
    });

    it("permite crear un vendedor mediante POST", async () => {
        const fetchMock = simularRespuesta({
            ...usuario,
            rol: "VENDEDOR"
        }, 201);

        const datos = {
            nombre: "Cliente Prueba",
            correo: "cliente@sonidovivo.cl",
            contrasena: "clave1234",
            rol: "VENDEDOR"
        };

        await crearUsuarioApi(datos);

        const opciones = fetchMock.mock.calls[0][1];

        expect(opciones.method).toBe("POST");
        expect(JSON.parse(opciones.body)).toEqual(datos);
        expect(opciones.headers.Authorization).toBe(
            "Bearer jwt-de-prueba"
        );
    });

    it("permite editar el rol de un usuario", async () => {
        const fetchMock = simularRespuesta({
            ...usuario,
            rol: "VENDEDOR"
        });

        const datos = {
            nombre: usuario.nombre,
            correo: usuario.correo,
            contrasena: "",
            rol: "VENDEDOR"
        };

        await actualizarUsuarioApi(5, datos);

        const [url, opciones] = fetchMock.mock.calls[0];

        expect(url).toBe(
            "http://localhost:8080/api/admin/usuarios/5"
        );
        expect(opciones.method).toBe("PUT");
        expect(JSON.parse(opciones.body).rol).toBe("VENDEDOR");
    });

    it("permite desactivar una cuenta", async () => {
        const fetchMock = simularRespuesta({
            ...usuario,
            activo: false
        });

        const resultado = await cambiarEstadoUsuarioApi(5, false);

        const [url, opciones] = fetchMock.mock.calls[0];

        expect(url).toContain("/api/admin/usuarios/5/estado");
        expect(opciones.method).toBe("PUT");
        expect(JSON.parse(opciones.body)).toEqual({
            activo: false
        });
        expect(resultado.activo).toBe(false);
    });

    it("no envia solicitudes sin JWT", async () => {
        vi.mocked(obtenerToken).mockReturnValue(null);

        const fetchMock = vi.fn();
        vi.stubGlobal("fetch", fetchMock);

        await expect(listarUsuariosApi()).rejects.toThrow(
            /debes iniciar sesión/i
        );

        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("informa cuando el backend responde 403", async () => {
        simularRespuesta(null, 403);

        await expect(listarUsuariosApi()).rejects.toThrow(
            /no tienes permisos/i
        );
    });

    it("informa cuando el backend rechaza un correo duplicado", async () => {
        simularRespuesta(null, 409);

        await expect(
            crearUsuarioApi({
                nombre: usuario.nombre,
                correo: usuario.correo,
                contrasena: "clave1234",
                rol: "CLIENTE"
            })
        ).rejects.toThrow(/correo no esté duplicado/i);
    });
});
