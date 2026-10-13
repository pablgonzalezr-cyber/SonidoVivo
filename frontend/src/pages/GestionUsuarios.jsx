
import { useState } from "react";

import {
    obtenerUsuarios,
    crearUsuarioAdmin,
    actualizarUsuarioAdmin,
    cambiarEstadoUsuario
} from "../services/usuariosService";

const formularioInicial = {
    nombre: "",
    correo: "",
    contrasena: "",
    rol: "CLIENTE"
};

function GestionUsuarios({ sesion }) {

    const [usuarios, setUsuarios] = useState(obtenerUsuarios());
    const [formulario, setFormulario] = useState(formularioInicial);
    const [idEditando, setIdEditando] = useState(null);
    const [mensaje, setMensaje] = useState("");
    const [error, setError] = useState("");

    function cambiarCampo(evento) {
        setFormulario({
            ...formulario,
            [evento.target.name]: evento.target.value
        });
    }

    function limpiarFormulario() {
        setFormulario({ ...formularioInicial });
        setIdEditando(null);
    }

    function guardarUsuario(evento) {

        evento.preventDefault();
        setError("");
        setMensaje("");

        try {

            if (idEditando !== null) {

                actualizarUsuarioAdmin(
                    idEditando,
                    formulario
                );

                setMensaje("Usuario actualizado correctamente.");

            } else {

                crearUsuarioAdmin(formulario);

                setMensaje("Usuario creado correctamente.");

            }

            setUsuarios(obtenerUsuarios());
            limpiarFormulario();

        } catch (error) {

            setError(error.message);

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

        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function alternarEstado(usuario) {

        const accion = usuario.activo === false
            ? "reactivar"
            : "desactivar";

        if (!window.confirm(`¿Deseas ${accion} esta cuenta?`)) {
            return;
        }

        setError("");
        setMensaje("");

        try {

            cambiarEstadoUsuario(usuario.id);

            setUsuarios(obtenerUsuarios());

            setMensaje(
                `Usuario ${usuario.activo === false
                    ? "reactivado"
                    : "desactivado"} correctamente.`
            );

        } catch (error) {

            setError(error.message);

        }
    }

    return (
        <section className="container py-5">

            <h2 className="fw-bold">
                Gestión de usuarios
            </h2>

            <p className="text-secondary">
                Administra las cuentas y sus permisos.
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
                            <label htmlFor="usuarioNombre" className="form-label">
                                Nombre
                            </label>
                            <input
                                id="usuarioNombre"
                                name="nombre"
                                type="text"
                                className="form-control"
                                value={formulario.nombre}
                                onChange={cambiarCampo}
                                required
                            />
                        </div>

                        <div className="col-md-6">
                            <label htmlFor="usuarioCorreo" className="form-label">
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
                            <label htmlFor="usuarioContrasena" className="form-label">
                                Contraseña
                            </label>
                            <input
                                id="usuarioContrasena"
                                name="contrasena"
                                type="password"
                                className="form-control"
                                value={formulario.contrasena}
                                onChange={cambiarCampo}
                                placeholder={
                                    idEditando !== null
                                        ? "Dejar vacío para conservar"
                                        : "Mínimo 6 caracteres"
                                }
                            />
                        </div>

                        <div className="col-md-6">
                            <label htmlFor="usuarioRol" className="form-label">
                                Rol
                            </label>
                            <select
                                id="usuarioRol"
                                name="rol"
                                className="form-select"
                                value={formulario.rol}
                                onChange={cambiarCampo}
                            >
                                <option value="CLIENTE">Cliente</option>
                                <option value="VENDEDOR">Vendedor</option>
                                <option value="ADMIN">Administrador</option>
                            </select>
                        </div>

                        <div className="col-12 d-flex gap-2">
                            <button type="submit" className="btn btn-dark">
                                {idEditando !== null
                                    ? "Guardar cambios"
                                    : "Crear usuario"}
                            </button>

                            {idEditando !== null && (
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={limpiarFormulario}
                                >
                                    Cancelar
                                </button>
                            )}
                        </div>

                    </div>
                </form>

            </div>

            <h3 className="h5 mb-3">
                Usuarios registrados ({usuarios.length})
            </h3>

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
                        {usuarios.map((usuario) => {

                            const esCuentaPropia =
                                String(usuario.id) === String(sesion.id);

                            return (
                                <tr key={usuario.id}>
                                    <td>{usuario.nombre}</td>
                                    <td>{usuario.correo}</td>
                                    <td>{usuario.rol}</td>

                                    <td>
                                        <span
                                            className={
                                                usuario.activo === false
                                                    ? "badge bg-secondary"
                                                    : "badge bg-success"
                                            }
                                        >
                                            {usuario.activo === false
                                                ? "Inactivo"
                                                : "Activo"}
                                        </span>
                                    </td>

                                    <td>
                                        <div className="d-flex gap-2">

                                            <button
                                                type="button"
                                                className="btn btn-outline-dark btn-sm"
                                                disabled={esCuentaPropia}
                                                onClick={() =>
                                                    seleccionarUsuario(usuario)
                                                }
                                            >
                                                Editar
                                            </button>

                                            <button
                                                type="button"
                                                className={
                                                    usuario.activo === false
                                                        ? "btn btn-success btn-sm"
                                                        : "btn btn-outline-danger btn-sm"
                                                }
                                                disabled={esCuentaPropia}
                                                onClick={() =>
                                                    alternarEstado(usuario)
                                                }
                                            >
                                                {usuario.activo === false
                                                    ? "Reactivar"
                                                    : "Desactivar"}
                                            </button>

                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

            </div>

            <p className="text-secondary small">
                Tu propia cuenta administrativa está protegida
                contra cambios desde este panel.
            </p>

        </section>
    );
}

export default GestionUsuarios;
