import { useState } from "react";
import {
    Link,
    useNavigate
} from "react-router-dom";

import {
    iniciarSesion
} from "../services/authService";


function Login({ onLogin }) {

    const [correo, setCorreo] =
        useState("");

    const [contrasena, setContrasena] =
        useState("");

    const [error, setError] =
        useState("");


    const navigate = useNavigate();


    function enviarLogin(evento) {

        evento.preventDefault();


        if (
            correo.trim() === "" ||
            contrasena === ""
        ) {

            setError(
                "Debes completar correo y contrasena."
            );

            return;

        }


        const usuario =
            iniciarSesion(
                correo,
                contrasena
            );


        if (!usuario) {

            setError(
                "Correo o contrasena incorrectos."
            );

            return;

        }


        setError("");


        onLogin(usuario);


        navigate("/");

    }


    return (

        <section className="container py-5">

            <div className="row justify-content-center">

                <div className="col-12 col-md-8 col-lg-5">

                    <h2 className="fw-bold">

                        Iniciar sesion

                    </h2>


                    <p className="text-secondary">

                        Ingresa a tu cuenta
                        de Sonido Vivo.

                    </p>


                    {error && (

                        <div className="alert alert-danger">

                            {error}

                        </div>

                    )}


                    <form
                        className="card p-4"
                        onSubmit={enviarLogin}
                    >

                        <div className="mb-3">

                            <label
                                htmlFor="correoLogin"
                                className="form-label"
                            >

                                Correo electronico

                            </label>


                            <input
                                id="correoLogin"
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
                                htmlFor="contrasenaLogin"
                                className="form-label"
                            >

                                Contrasena

                            </label>


                            <input
                                id="contrasenaLogin"
                                type="password"
                                className="form-control"
                                value={contrasena}
                                onChange={(evento) =>
                                    setContrasena(
                                        evento.target.value
                                    )
                                }
                            />

                        </div>


                        <button
                            type="submit"
                            className="btn btn-dark w-100"
                        >

                            Iniciar sesion

                        </button>


                        <p className="text-center mt-3 mb-0">

                            ¿No tienes cuenta?
                            {" "}

                            <Link to="/registro">

                                Registrate

                            </Link>

                        </p>

                    </form>

                </div>

            </div>

        </section>

    );

}


export default Login;