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


function inicializarVendedor() {

    const usuarios = obtenerUsuarios();

    const existeVendedor = usuarios.some(
        (usuario) =>
            usuario.rol === "VENDEDOR" ||
            usuario.correo === "vendedor@sonidovivo.cl"
    );

    if (existeVendedor) {
        return;
    }

    const vendedor = {
        id: "vendedor-demo",
        nombre: "Vendedor Sonido Vivo",
        correo: "vendedor@sonidovivo.cl",
        contrasena: "vendedor123",
        rol: "VENDEDOR"
    };

    usuarios.push(vendedor);

    guardarUsuarios(usuarios);

}


function validarDatosAdmin(datos, idActual = null) {

    const nombre = String(datos.nombre || "").trim();
    const correo = String(datos.correo || "").trim().toLowerCase();
    const contrasena = String(datos.contrasena || "");
    const rol = datos.rol;

    if (nombre.length < 3) {
        throw new Error("El nombre debe tener al menos 3 caracteres.");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
        throw new Error("Ingresa un correo valido.");
    }

    if (!["ADMIN", "VENDEDOR", "CLIENTE"].includes(rol)) {
        throw new Error("Selecciona un rol valido.");
    }

    if (contrasena !== "" && contrasena.length < 6) {
        throw new Error("La contrasena debe tener al menos 6 caracteres.");
    }

    const existeCorreo = obtenerUsuarios().some(
        (usuario) =>
            usuario.correo.toLowerCase() === correo &&
            String(usuario.id) !== String(idActual)
    );

    if (existeCorreo) {
        throw new Error("El correo ya se encuentra registrado.");
    }

    return { nombre, correo, contrasena, rol };
}

function crearUsuarioAdmin(datos) {

    const datosValidos = validarDatosAdmin(datos);

    if (datosValidos.contrasena === "") {
        throw new Error("Debes ingresar una contrasena.");
    }

    const usuarios = obtenerUsuarios();

    const nuevoUsuario = {
        id: `usuario-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        ...datosValidos,
        activo: true
    };

    usuarios.push(nuevoUsuario);
    guardarUsuarios(usuarios);

    return nuevoUsuario;
}

function actualizarUsuarioAdmin(id, datos) {

    const usuarios = obtenerUsuarios();

    const indice = usuarios.findIndex(
        (usuario) => String(usuario.id) === String(id)
    );

    if (indice === -1) {
        throw new Error("El usuario no existe.");
    }

    const usuarioActual = usuarios[indice];

    const sesionActual = JSON.parse(
        localStorage.getItem("sonidoVivoSesion") || "null"
    );

    if (String(sesionActual?.id) === String(id)) {
        throw new Error("No puedes editar tu propia cuenta desde este panel.");
    }

    const datosValidos = validarDatosAdmin(datos, id);

    const administradoresActivos = usuarios.filter(
        (usuario) =>
            usuario.rol === "ADMIN" &&
            usuario.activo !== false
    ).length;

    if (
        usuarioActual.rol === "ADMIN" &&
        usuarioActual.activo !== false &&
        datosValidos.rol !== "ADMIN" &&
        administradoresActivos <= 1
    ) {
        throw new Error("Debe existir al menos un administrador activo.");
    }

    const usuarioActualizado = {
        ...usuarioActual,
        nombre: datosValidos.nombre,
        correo: datosValidos.correo,
        rol: datosValidos.rol
    };

    if (datosValidos.contrasena !== "") {
        usuarioActualizado.contrasena = datosValidos.contrasena;
    }

    usuarios[indice] = usuarioActualizado;

    guardarUsuarios(usuarios);

    return usuarioActualizado;
}

function cambiarEstadoUsuario(id) {

    const usuarios = obtenerUsuarios();

    const indice = usuarios.findIndex(
        (usuario) => String(usuario.id) === String(id)
    );

    if (indice === -1) {
        throw new Error("El usuario no existe.");
    }

    const usuario = usuarios[indice];

    const sesionActual = JSON.parse(
        localStorage.getItem("sonidoVivoSesion") || "null"
    );

    if (String(sesionActual?.id) === String(id)) {
        throw new Error("No puedes desactivar tu propia cuenta.");
    }

    const nuevoEstado = usuario.activo === false;

    if (usuario.rol === "ADMIN" && !nuevoEstado) {

        const administradoresActivos = usuarios.filter(
            (item) =>
                item.rol === "ADMIN" &&
                item.activo !== false
        ).length;

        if (administradoresActivos <= 1) {
            throw new Error("No puedes desactivar al ultimo administrador.");
        }
    }

    usuarios[indice] = {
        ...usuario,
        activo: nuevoEstado
    };

    guardarUsuarios(usuarios);

    return usuarios[indice];
}






export {
    obtenerUsuarios,
    correoRegistrado,
    registrarUsuario,
    inicializarAdministrador,
    inicializarVendedor,
    crearUsuarioAdmin,
    actualizarUsuarioAdmin,
    cambiarEstadoUsuario
};
