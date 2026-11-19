import { useEffect, useState } from "react";

import {
    listarUsuariosApi,
    crearUsuarioApi,
    actualizarUsuarioApi,
    cambiarEstadoUsuarioApi
} from "../services/usuariosApi";

const formularioInicial = {
    nombre: "",
    correo: "",
    contrasena: "",
    rol: "CLIENTE"
};

function GestionUsuarios({ sesion }) {
    const [usuarios, setUsuarios] = useState([]);
    const [formulario, setFormulario] = useState(formularioInicial);
    const [idEditando, setIdEditando] = useState(null);
    const [mensaje, setMensaje] = useState("");
    const [error, setError] = useState("");
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [procesandoId, setProcesandoId] = useState(null);

    useEffect(() => {
        let activo = true;

        listarUsuariosApi()
            .then((datos) => {
                if (activo) {
                    setUsuarios(datos);
                }
            })
            .catch((error) => {
                if (activo) {
                    setError(error.message);
                }
            })
            .finally(() => {
                if (activo) {
                    setCargando(false);
                }
            });

        return () => {
            activo = false;
        };
    }, []);

    async function recargarUsuarios() {
        setError("");
        setCargando(true);

        try {
            const datos = await listarUsuariosApi();
            setUsuarios(datos);
        } catch (error) {
            setError(error.message);
        } finally {
            setCargando(false);
        }
    }

    function cambiarCampo(evento) {
        const { name, value } = evento.target;

        setFormulario((actual) => ({
            ...actual,
            [name]: value
        }));
    }

    function limpiarFormulario() {
        setFormulario({ ...formularioInicial });
        setIdEditando(null);
    }

    async function guardarUsuario(evento) {
        evento.preventDefault();

        setError("");
        setMensaje("");

        const nombre = formulario.nombre.trim();
        const correo = formulario.correo.trim().toLowerCase();
        const contrasena = formulario.contrasena;

        if (nombre.length < 3 || nombre.length > 120) {
            setError(
                "El nombre debe tener entre 3 y 120 caracteres."
            );
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
            setError("Ingresa un correo electrónico válido.");
            return;
        }

        if (
            contrasena !== "" &&
            (contrasena.length < 8 || contrasena.length > 72)
        ) {
            setError(
                "La contraseña debe tener entre 8 y 72 caracteres."
            );
            return;
        }

        if (idEditando === null && contrasena === "") {
            setError(
                "Debes ingresar una contraseña para crear el usuario."
            );
            return;
        }

        const datos = {
            nombre,
            correo,
            contrasena,
            rol: formulario.rol
        };

        setGuardando(true);

        try {
            if (idEditando !== null) {
                await actualizarUsuarioApi(idEditando, datos);
            } else {
                await crearUsuarioApi(datos);
            }

            const usuariosActualizados = await listarUsuariosApi();

            setUsuarios(usuariosActualizados);

            setMensaje(
                idEditando !== null
                    ? "Usuario actualizado correctamente."
                    : "Usuario creado correctamente."
            );

            limpiarFormulario();
        } catch (error) {
            setError(error.message);
        } finally {
            setGuardando(false);
        }
    }

    function seleccionarUsuario(usuario) {
        setFormulario({
            nombre: usuario.nombre,
            correo: usuario.correo,
            contrasena: "",
            rol: usuario.rol
        });

        setIdEditando(usuario.id);
        setMensaje("");
        setError("");

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }

    async function alternarEstado(usuario) {
        const nuevoEstado = !usuario.activo;

        const accion = nuevoEstado
            ? "reactivar"
            : "desactivar";

        if (!window.confirm(
            `¿Deseas ${accion} la cuenta de ${usuario.nombre}?`
        )) {
            return;
        }

        setError("");
        setMensaje("");
        setProcesandoId(usuario.id);

        try {
            const actualizado = await cambiarEstadoUsuarioApi(
                usuario.id,
                nuevoEstado
            );

            setUsuarios((actuales) =>
                actuales.map((item) =>
                    item.id === actualizado.id
                        ? actualizado
                        : item
                )
            );

            setMensaje(
                nuevoEstado
                    ? "Usuario reactivado correctamente."
                    : "Usuario desactivado correctamente."
            );
        } catch (error) {
            setError(error.message);
        } finally {
            setProcesandoId(null);
        }
    }

    return (
        <section className="container py-5">
            <h2 className="fw-bold">
                Gestión de usuarios
            </h2>

            <p className="text-secondary">
                Administra las cuentas almacenadas en MariaDB.
            </p>

            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            {mensaje && (
                <div className="alert alert-success" role="status">
                    {mensaje}
                </div>
            )}

            <div className="card p-4 mb-4">
                <h3 className="h5 mb-3">
                    {idEditando !== null
                        ? "Editar usuario"
                        : "Crear usuario"}
                </h3>

                <form onSubmit={guardarUsuario}>
                    <div className="row g-3">
                        <div className="col-md-6">
                            <label
                                htmlFor="usuarioNombre"
                                className="form-label"
                            >
                                Nombre
                            </label>

                            <input
                                id="usuarioNombre"
                                name="nombre"
                                type="text"
                                className="form-control"
                                value={formulario.nombre}
                                onChange={cambiarCampo}
                                minLength={3}
                                maxLength={120}
                                required
                            />
                        </div>

                        <div className="col-md-6">
                            <label
                                htmlFor="usuarioCorreo"
                                className="form-label"
                            >
                                Correo electrónico
                            </label>

                            <input
                                id="usuarioCorreo"
                                name="correo"
                                type="email"
                                className="form-control"
                                value={formulario.correo}
                                onChange={cambiarCampo}
                                required
                            />
                        </div>

                        <div className="col-md-6">
                            <label
                                htmlFor="usuarioContrasena"
                                className="form-label"
                            >
                                Contraseña
                            </label>

                            <input
                                id="usuarioContrasena"
                                name="contrasena"
                                type="password"
                                className="form-control"
                                value={formulario.contrasena}
                                onChange={cambiarCampo}
                                minLength={formulario.contrasena ? 8 : undefined}
                                maxLength={72}
                                required={idEditando === null}
                                placeholder={
                                    idEditando !== null
                                        ? "Dejar vacío para conservar"
                                        : "Mínimo 8 caracteres"
                                }
                            />
                        </div>

                        <div className="col-md-6">
                            <label
                                htmlFor="usuarioRol"
                                className="form-label"
                            >
                                Rol
                            </label>

                            <select
                                id="usuarioRol"
                                name="rol"
                                className="form-select"
                                value={formulario.rol}
                                onChange={cambiarCampo}
                                required
                            >
                                <option value="CLIENTE">
                                    Cliente
                                </option>

                                <option value="VENDEDOR">
                                    Vendedor
                                </option>

                                <option value="ADMIN">
                                    Administrador
                                </option>
                            </select>
                        </div>

                        <div className="col-12 d-flex gap-2">
                            <button
                                type="submit"
                                className="btn btn-dark"
                                disabled={guardando}
                            >
                                {guardando
                                    ? "Guardando..."
                                    : idEditando !== null
                                        ? "Guardar cambios"
                                        : "Crear usuario"}
                            </button>

                            {idEditando !== null && (
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={limpiarFormulario}
                                    disabled={guardando}
                                >
                                    Cancelar
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>

            <div className="d-flex align-items-center justify-content-between mb-3">
                <h3 className="h5 mb-0">
                    Usuarios registrados ({usuarios.length})
                </h3>

                <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={recargarUsuarios}
                    disabled={cargando || guardando}
                >
                    Actualizar lista
                </button>
            </div>

            {cargando ? (
                <p role="status">Cargando usuarios...</p>
            ) : (
                <div className="table-responsive">
                    <table className="table table-striped align-middle">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Correo</th>
                                <th>Rol</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>

                        <tbody>
                            {usuarios.length === 0 && (
                                <tr>
                                    <td colSpan={5}>
                                        No hay usuarios para mostrar.
                                    </td>
                                </tr>
                            )}

                            {usuarios.map((usuario) => {
                                const esCuentaPropia =
                                    String(usuario.id) ===
                                    String(sesion?.id);

                                return (
                                    <tr key={usuario.id}>
                                        <td>{usuario.nombre}</td>
                                        <td>{usuario.correo}</td>
                                        <td>{usuario.rol}</td>

                                        <td>
                                            <span
                                                className={
                                                    usuario.activo
                                                        ? "badge bg-success"
                                                        : "badge bg-secondary"
                                                }
                                            >
                                                {usuario.activo
                                                    ? "Activo"
                                                    : "Inactivo"}
                                            </span>
                                        </td>

                                        <td>
                                            <div className="d-flex gap-2">
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-dark btn-sm"
                                                    disabled={
                                                        esCuentaPropia ||
                                                        procesandoId !== null ||
                                                        guardando
                                                    }
                                                    onClick={() =>
                                                        seleccionarUsuario(usuario)
                                                    }
                                                >
                                                    Editar
                                                </button>

                                                <button
                                                    type="button"
                                                    className={
                                                        usuario.activo
                                                            ? "btn btn-outline-danger btn-sm"
                                                            : "btn btn-success btn-sm"
                                                    }
                                                    disabled={
                                                        esCuentaPropia ||
                                                        procesandoId !== null ||
                                                        guardando
                                                    }
                                                    onClick={() =>
                                                        alternarEstado(usuario)
                                                    }
                                                >
                                                    {procesandoId === usuario.id
                                                        ? "Procesando..."
                                                        : usuario.activo
                                                            ? "Desactivar"
                                                            : "Reactivar"}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            <p className="text-secondary small">
                Tu cuenta administrativa no se puede modificar
                ni desactivar desde este panel.
            </p>
        </section>
    );
}

export default GestionUsuarios;
