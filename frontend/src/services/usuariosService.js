const CLAVE_USUARIOS = "sonidoVivoUsuarios";


function obtenerUsuarios() {

    const datos =
        localStorage.getItem(CLAVE_USUARIOS);


    if (!datos) {

        return [];

    }


    return JSON.parse(datos);

}


function guardarUsuarios(usuarios) {

    localStorage.setItem(
        CLAVE_USUARIOS,
        JSON.stringify(usuarios)
    );

}


function correoRegistrado(correo) {

    const usuarios = obtenerUsuarios();


    return usuarios.some(
        (usuario) =>
            usuario.correo.toLowerCase() ===
            correo.trim().toLowerCase()
    );

}


function registrarUsuario(usuario) {

    const usuarios = obtenerUsuarios();


    const nuevoUsuario = {

        id: Date.now(),

        nombre: usuario.nombre.trim(),

        correo:
            usuario.correo
                .trim()
                .toLowerCase(),

        contrasena: usuario.contrasena,

        rol: "CLIENTE"

    };


    usuarios.push(nuevoUsuario);


    guardarUsuarios(usuarios);


    return nuevoUsuario;

}


function inicializarAdministrador() {

    const usuarios = obtenerUsuarios();


    const existeAdministrador =
        usuarios.some(
            (usuario) =>
                usuario.rol === "ADMIN"
        );


    if (existeAdministrador) {

        return;

    }


    const administrador = {

        id: Date.now(),

        nombre: "Administrador Sonido Vivo",

        correo: "admin@sonidovivo.cl",

        contrasena: "admin123",

        rol: "ADMIN"

    };


    usuarios.push(administrador);


    guardarUsuarios(usuarios);

}


export {
    obtenerUsuarios,
    correoRegistrado,
    registrarUsuario,
    inicializarAdministrador
};