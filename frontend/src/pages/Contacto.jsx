import { useState } from "react";

import {
    validarNombre,
    validarCorreo,
    validarMensaje
} from "../utils/validaciones";


function Contacto() {

    const [nombre, setNombre] = useState("");

    const [correo, setCorreo] = useState("");

    const [mensaje, setMensaje] = useState("");

    const [error, setError] = useState("");

    const [enviado, setEnviado] = useState(false);


    function enviarFormulario(evento) {

        evento.preventDefault();

        setEnviado(false);


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


        if (!validarMensaje(mensaje)) {

            setError(
                "El mensaje debe tener al menos 10 caracteres."
            );

            return;

        }


        setError("");

        setEnviado(true);


        setNombre("");

        setCorreo("");

        setMensaje("");

    }


    return (

        <section className="container py-5">

            <div className="row justify-content-center">

                <div className="col-12 col-lg-8">

                    <h2 className="fw-bold">

                        Contacto

                    </h2>


                    <p className="text-secondary">

                        Envianos tu consulta sobre
                        instrumentos o equipos musicales.

                    </p>


                    {error && (

                        <div className="alert alert-danger">

                            {error}

                        </div>

                    )}


                    {enviado && (

                        <div className="alert alert-success">

                            Tu mensaje fue registrado correctamente.

                        </div>

                    )}


                    <form
                        onSubmit={enviarFormulario}
                        className="card p-4"
                    >

                        <div className="mb-3">

                            <label
                                htmlFor="nombre"
                                className="form-label"
                            >
                                Nombre
                            </label>


                            <input
                                id="nombre"
                                type="text"
                                className="form-control"
                                value={nombre}
                                onChange={(evento) =>
                                    setNombre(evento.target.value)
                                }
                            />

                        </div>


                        <div className="mb-3">

                            <label
                                htmlFor="correo"
                                className="form-label"
                            >
                                Correo electronico
                            </label>


                            <input
                                id="correo"
                                type="text"
                                className="form-control"
                                value={correo}
                                onChange={(evento) =>
                                    setCorreo(evento.target.value)
                                }
                            />

                        </div>


                        <div className="mb-3">

                            <label
                                htmlFor="mensaje"
                                className="form-label"
                            >
                                Mensaje
                            </label>


                            <textarea
                                id="mensaje"
                                className="form-control"
                                rows="5"
                                value={mensaje}
                                onChange={(evento) =>
                                    setMensaje(evento.target.value)
                                }
                            >
                            </textarea>

                        </div>


                        <button
                            type="submit"
                            className="btn btn-dark"
                        >

                            Enviar consulta

                        </button>

                    </form>

                </div>

            </div>

        </section>

    );

}


export default Contacto;