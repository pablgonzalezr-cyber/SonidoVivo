import {
    obtenerUsuarios
} from "./usuariosService";


const CLAVE_SESION = "sonidoVivoSesion";


function iniciarSesion(correo, contrasena) {

    const usuarios = obtenerUsuarios();


    const usuarioEncontrado =
        usuarios.find(
            (usuario) =>
                usuario.correo ===
                    correo.trim().toLowerCase() &&
                usuario.contrasena === contrasena
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


    localStorage.setItem(
        CLAVE_SESION,
        JSON.stringify(sesion)
    );


    return sesion;

}


function obtenerSesion() {

    const datos =
        localStorage.getItem(CLAVE_SESION);


    if (!datos) {

        return null;

    }


    return JSON.parse(datos);

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