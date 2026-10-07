function Navbar() {

    return (

        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">

            <div className="container">

                <a
                    className="navbar-brand"
                    href="/"
                >
                    Sonido Vivo
                </a>


                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarPrincipal"
                    aria-controls="navbarPrincipal"
                    aria-expanded="false"
                    aria-label="Abrir navegación"
                >

                    <span className="navbar-toggler-icon"></span>

                </button>


                <div
                    className="collapse navbar-collapse"
                    id="navbarPrincipal"
                >

                    <ul className="navbar-nav ms-auto">

                        <li className="nav-item">

                            <a
                                className="nav-link active"
                                href="/"
                            >

                                Inicio

                            </a>

                        </li>


                        <li className="nav-item">

                            <a
                                className="nav-link"
                                href="#productos"
                            >

                                Productos

                            </a>

                        </li>


                        <li className="nav-item">

                            <a
                                className="nav-link"
                                href="#contacto"
                            >

                                Contacto

                            </a>

                        </li>

                    </ul>

                </div>

            </div>

        </nav>

    );

}


export default Navbar;