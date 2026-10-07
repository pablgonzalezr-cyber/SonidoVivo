function MiCuenta({
    sesion
}) {

    return (

        <section className="container py-5">

            <div className="row justify-content-center">

                <div className="col-12 col-lg-8">

                    <h2 className="fw-bold">

                        Mi Cuenta

                    </h2>


                    <p className="text-secondary">

                        Informacion de tu cuenta
                        en Sonido Vivo.

                    </p>


                    <div className="card p-4 mt-4">

                        <div className="mb-3">

                            <strong>
                                Nombre
                            </strong>


                            <p className="mb-0">

                                {sesion.nombre}

                            </p>

                        </div>


                        <hr />


                        <div className="mb-3">

                            <strong>
                                Correo electronico
                            </strong>


                            <p className="mb-0">

                                {sesion.correo}

                            </p>

                        </div>


                        <hr />


                        <div>

                            <strong>
                                Tipo de usuario
                            </strong>


                            <p className="mb-0">

                                {sesion.rol}

                            </p>

                        </div>

                    </div>

                </div>

            </div>

        </section>

    );

}


export default MiCuenta;