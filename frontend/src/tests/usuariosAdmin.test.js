
import {
    beforeEach,
    describe,
    it,
    expect
} from "vitest";

import {
    obtenerUsuarios,
    inicializarAdministrador,
    crearUsuarioAdmin,
    actualizarUsuarioAdmin,
    cambiarEstadoUsuario
} from "../services/usuariosService";

import {
    iniciarSesion
} from "../services/authService";

const datosCliente = {
    nombre: "Cliente Prueba",
    correo: "prueba@sonidovivo.cl",
    contrasena: "clave123",
    rol: "CLIENTE"
};

beforeEach(() => {
    localStorage.clear();
    inicializarAdministrador();
});

describe("Administración de usuarios", () => {

    it("permite crear un usuario", () => {

        const usuario = crearUsuarioAdmin(datosCliente);

        expect(usuario.rol).toBe("CLIENTE");
        expect(usuario.activo).toBe(true);
        expect(obtenerUsuarios()).toHaveLength(2);

    });

    it("rechaza correos duplicados", () => {

        crearUsuarioAdmin(datosCliente);

        expect(() => {
            crearUsuarioAdmin(datosCliente);
        }).toThrow(/correo/i);

    });

    it("permite cambiar el rol de un usuario", () => {

        const usuario = crearUsuarioAdmin(datosCliente);

        const actualizado = actualizarUsuarioAdmin(
            usuario.id,
            {
                ...datosCliente,
                contrasena: "",
                rol: "VENDEDOR"
            }
        );

        expect(actualizado.rol).toBe("VENDEDOR");
        expect(actualizado.contrasena).toBe("clave123");

    });

    it("impide iniciar sesión con una cuenta desactivada", () => {

        const usuario = crearUsuarioAdmin(datosCliente);

        const administrador = obtenerUsuarios().find(
            (item) => item.rol === "ADMIN"
        );

        localStorage.setItem(
            "sonidoVivoSesion",
            JSON.stringify({
                id: administrador.id,
                rol: "ADMIN"
            })
        );

        cambiarEstadoUsuario(usuario.id);

        expect(
            iniciarSesion(
                datosCliente.correo,
                datosCliente.contrasena
            )
        ).toBeNull();

        cambiarEstadoUsuario(usuario.id);

        expect(
            iniciarSesion(
                datosCliente.correo,
                datosCliente.contrasena
            )
        ).not.toBeNull();

    });

    it("protege al último administrador activo", () => {

        const administrador = obtenerUsuarios().find(
            (usuario) => usuario.rol === "ADMIN"
        );

        expect(() => {
            cambiarEstadoUsuario(administrador.id);
        }).toThrow(/administrador/i);

    });

});
