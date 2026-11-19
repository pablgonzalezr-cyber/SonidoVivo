function validarNombre(nombre) {
    return nombre.trim().length >= 3;
}

function validarCorreo(correo) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        correo.trim()
    );
}

function validarMensaje(mensaje) {
    return mensaje.trim().length >= 10;
}

function validarContrasena(contrasena) {
    return (
        contrasena.length >= 8 &&
        contrasena.length <= 72
    );
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
