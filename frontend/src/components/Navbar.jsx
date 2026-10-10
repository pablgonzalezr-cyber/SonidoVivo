import { useState } from "react";
import { NavLink } from "react-router-dom";

function Navbar({ sesion, onLogout }) {
    const [menuAbierto, setMenuAbierto] = useState(false);

    function cerrarMenu() {
        setMenuAbierto(false);
    }

    function salir() {
        cerrarMenu();
        onLogout();
    }

    return (
        <nav
            className="navbar navbar-expand-lg navbar-dark bg-dark"
            aria-label="Navegación principal"
        >
            <div className="container">
                <NavLink
                    className="navbar-brand"
                    to="/"
                    onClick={cerrarMenu}
                >
                    Sonido Vivo
                </NavLink>

                <button
                    className="navbar-toggler"
                    type="button"
                    aria-controls="navbarPrincipal"
                    aria-expanded={menuAbierto}
                    aria-label={
                        menuAbierto
                            ? "Cerrar navegación"
                            : "Abrir navegación"
                    }
                    onClick={() => setMenuAbierto(!menuAbierto)}
                >
                    <span className="navbar-toggler-icon" />
                </button>

                <div
                    id="navbarPrincipal"
                    className={
                        `collapse navbar-collapse ${menuAbierto ? "show" : ""}`
                    }
                >
                    <ul className="navbar-nav ms-auto align-items-lg-center">
                        <li className="nav-item">
                            <NavLink
                                className="nav-link"
                                to="/"
                                onClick={cerrarMenu}
                            >
                                Inicio
                            </NavLink>
                        </li>

                        <li className="nav-item">
                            <NavLink
                                className="nav-link"
                                to="/productos"
                                onClick={cerrarMenu}
                            >
                                Productos
                            </NavLink>
                        </li>

                        <li className="nav-item">
                            <NavLink
                                className="nav-link"
                                to="/contacto"
                                onClick={cerrarMenu}
                            >
                                Contacto
                            </NavLink>
                        </li>

                        <li className="nav-item">
                            <NavLink
                                className="nav-link"
                                to="/carrito"
                                onClick={cerrarMenu}
                            >
                                Carrito
                            </NavLink>
                        </li>

                        {!sesion ? (
                            <>
                                <li className="nav-item">
                                    <NavLink
                                        className="nav-link"
                                        to="/registro"
                                        onClick={cerrarMenu}
                                    >
                                        Registrarse
                                    </NavLink>
                                </li>
                                <li className="nav-item">
                                    <NavLink
                                        className="nav-link"
                                        to="/login"
                                        onClick={cerrarMenu}
                                    >
                                        Iniciar sesión
                                    </NavLink>
                                </li>
                            </>
                        ) : (
                            <>
                                {sesion.rol === "ADMIN" && (
                                    <li className="nav-item">
                                        <NavLink
                                            className="nav-link"
                                            to="/admin"
                                            onClick={cerrarMenu}
                                        >
                                            Administración
                                        </NavLink>
                                    </li>
                                )}

                                <li className="nav-item">
                                    <NavLink
                                        className="nav-link"
                                        to="/mis-pedidos"
                                        onClick={cerrarMenu}
                                    >
                                        Mis pedidos
                                    </NavLink>
                                </li>

                                <li className="nav-item">
                                    <NavLink
                                        className="nav-link"
                                        to="/mi-cuenta"
                                        onClick={cerrarMenu}
                                    >
                                        Mi cuenta
                                    </NavLink>
                                </li>

                                <li className="nav-item">
                                    <span className="nav-link">
                                        Hola, {sesion.nombre}
                                    </span>
                                </li>

                                <li className="nav-item">
                                    <button
                                        type="button"
                                        className="nav-link btn btn-link"
                                        onClick={salir}
                                    >
                                        Cerrar sesión
                                    </button>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;