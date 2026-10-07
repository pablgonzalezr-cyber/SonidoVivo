function validarNombre(nombre) {

    return nombre.trim().length >= 3;

}


function validarCorreo(correo) {

    return (
        correo.includes("@") &&
        correo.includes(".")
    );

}


function validarMensaje(mensaje) {

    return mensaje.trim().length >= 10;

}


function validarContrasena(contrasena) {

    return contrasena.length >= 6;

}


function validarConfirmacionContrasena(
    contrasena,
    confirmarContrasena
) {

    return contrasena === confirmarContrasena;

}


export {
    validarNombre,
    validarCorreo,
    validarMensaje,
    validarContrasena,
    validarConfirmacionContrasena
};