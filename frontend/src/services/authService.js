import {
    migrarCarritoInvitado
} from "./carritoService";


import {
    obtenerUsuarios
} from "./usuariosService";


const CLAVE_SESION = "sonidoVivoSesion";


function iniciarSesion(correo, contrasena) {

    const usuarios = obtenerUsuarios();


    
    const usuarioEncontrado = usuarios.find(
        (usuario) =>
            usuario.correo === correo.trim().toLowerCase() &&
            usuario.contrasena === contrasena &&
            usuario.activo !== false
    );



    if (!usuarioEncontrado) {

        return null;

    }


    const sesion = {

        id: usuarioEncontrado.id,

        nombre: usuarioEncontrado.nombre,

        correo: usuarioEncontrado.correo,

        rol: usuarioEncontrado.rol

    };

    
    if (sesion.rol === "CLIENTE") {
        migrarCarritoInvitado(sesion.id);
    }



    localStorage.setItem(
        CLAVE_SESION,
        JSON.stringify(sesion)
    );


    return sesion;

}



function obtenerSesion() {

    const datos = localStorage.getItem(CLAVE_SESION);

    if (!datos) {
        return null;
    }

    try {

        const sesionGuardada = JSON.parse(datos);

        const usuario = obtenerUsuarios().find(
            (item) =>
                String(item.id) === String(sesionGuardada.id) &&
                item.activo !== false
        );

        if (!usuario) {
            cerrarSesion();
            return null;
        }

        const sesionActualizada = {
            id: usuario.id,
            nombre: usuario.nombre,
            correo: usuario.correo,
            rol: usuario.rol
        };

        localStorage.setItem(
            CLAVE_SESION,
            JSON.stringify(sesionActualizada)
        );

        return sesionActualizada;

    } catch {

        cerrarSesion();
        return null;

    }
}


function cerrarSesion() {

    localStorage.removeItem(
        CLAVE_SESION
    );

}


export {
    iniciarSesion,
    obtenerSesion,
    cerrarSesion
};