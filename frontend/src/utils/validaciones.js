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


export {
    validarNombre,
    validarCorreo,
    validarMensaje
};
