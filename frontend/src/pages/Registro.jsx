import { useState } from "react";

import {
    validarNombre,
    validarCorreo,
    validarContrasena,
    validarConfirmacionContrasena
} from "../utils/validaciones";

import {
    correoRegistrado,
    registrarUsuario
} from "../services/usuariosService";


function Registro() {

    const [nombre, setNombre] = useState("");

    const [correo, setCorreo] = useState("");

    const [contrasena, setContrasena] = useState("");

    const [
        confirmarContrasena,
        setConfirmarContrasena
    ] = useState("");


    const [error, setError] = useState("");

    const [registrado, setRegistrado] =
        useState(false);


    function enviarRegistro(evento) {

        evento.preventDefault();

        setRegistrado(false);


        if (!validarNombre(nombre)) {

            setError(
                "El nombre debe tener al menos 3 caracteres."
            );

            return;

        }


        if (!validarCorreo(correo)) {

            setError(
                "Ingresa un correo valido."
            );

            return;

        }


        if (!validarContrasena(contrasena)) {

            setError(
                "La contrasena debe tener al menos 6 caracteres."
            );

            return;

        }


        if (
            !validarConfirmacionContrasena(
                contrasena,
                confirmarContrasena
            )
        ) {

            setError(
                "Las contrasenas no coinciden."
            );

            return;

        }


        if (correoRegistrado(correo)) {

            setError(
                "El correo ya se encuentra registrado."
            );

            return;

        }


        registrarUsuario({

            nombre: nombre,

            correo: correo,

            contrasena: contrasena

        });


        setError("");

        setRegistrado(true);


        setNombre("");

        setCorreo("");

        setContrasena("");

        setConfirmarContrasena("");

    }


    return (

        <section className="container py-5">

            <div className="row justify-content-center">

                <div className="col-12 col-md-8 col-lg-6">

                    <h2 className="fw-bold">

                        Crear cuenta

                    </h2>


                    <p className="text-secondary">

                        Registrate como cliente
                        de Sonido Vivo.

                    </p>


                    {error && (

                        <div className="alert alert-danger">

                            {error}

                        </div>

                    )}


                    {registrado && (

                        <div className="alert alert-success">

                            Usuario registrado correctamente.

                        </div>

                    )}


                    <form
                        className="card p-4"
                        onSubmit={enviarRegistro}
                    >

                        <div className="mb-3">

                            <label
                                htmlFor="nombreRegistro"
                                className="form-label"
                            >

                                Nombre

                            </label>


                            <input
                                id="nombreRegistro"
                                type="text"
                                className="form-control"
                                value={nombre}
                                onChange={(evento) =>
                                    setNombre(
                                        evento.target.value
                                    )
                                }
                            />

                        </div>


                        <div className="mb-3">

                            <label
                                htmlFor="correoRegistro"
                                className="form-label"
                            >

                                Correo electronico

                            </label>


                            <input
                                id="correoRegistro"
                                type="email"
                                className="form-control"
                                value={correo}
                                onChange={(evento) =>
                                    setCorreo(
                                        evento.target.value
                                    )
                                }
                            />

                        </div>


                        <div className="mb-3">

                            <label
                                htmlFor="contrasenaRegistro"
                                className="form-label"
                            >

                                Contrasena

                            </label>


                            <input
                                id="contrasenaRegistro"
                                type="password"
                                className="form-control"
                                value={contrasena}
                                onChange={(evento) =>
                                    setContrasena(
                                        evento.target.value
                                    )
                                }
                            />

                            <small className="text-secondary">

                                Minimo 6 caracteres.

                            </small>

                        </div>


                        <div className="mb-3">

                            <label
                                htmlFor="confirmarContrasena"
                                className="form-label"
                            >

                                Confirmar contrasena

                            </label>


                            <input
                                id="confirmarContrasena"
                                type="password"
                                className="form-control"
                                value={confirmarContrasena}
                                onChange={(evento) =>
                                    setConfirmarContrasena(
                                        evento.target.value
                                    )
                                }
                            />

                        </div>


                        <button
                            type="submit"
                            className="btn btn-dark"
                        >

                            Crear cuenta

                        </button>

                    </form>

                </div>

            </div>

        </section>

    );

}


export default Registro;