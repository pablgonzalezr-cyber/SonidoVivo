import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";

import LayoutPrincipal from "./components/LayoutPrincipal";
import RutaProtegida from "./components/RutaProtegida";

import Inicio from "./pages/Inicio";
import Productos from "./pages/Productos";
import DetalleProducto from "./pages/DetalleProducto";
import Contacto from "./pages/Contacto";
import Ubicaciones from "./pages/Ubicaciones";
import Carrito from "./pages/Carrito";
import Registro from "./pages/Registro";
import Login from "./pages/Login";
import MiCuenta from "./pages/MiCuenta";
import PanelAdmin from "./pages/PanelAdmin";
import PanelVendedor from "./pages/PanelVendedor";
import GestionProductos from "./pages/GestionProductos";
import Checkout from "./pages/Checkout";
import MisPedidos from "./pages/MisPedidos";
import GestionPedidos from "./pages/GestionPedidos";
import GestionUsuarios from "./pages/GestionUsuarios";
import ReportesVentas from "./pages/ReportesVentas";
import NotFound from "./pages/NotFound";

import {
    recuperarSesion,
    obtenerExpiracionToken,
    cerrarSesion
} from "./services/authService";

import { inicializarProductos } from "./services/productosService";

function App() {
    const [sesion, setSesion] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [errorInicio, setErrorInicio] = useState("");

    useEffect(() => {
        let activo = true;

        inicializarProductos();

        async function verificarSesion() {
            try {
                const usuario = await recuperarSesion();

                if (activo) {
                    setSesion(usuario);
                }
            } catch {
                if (activo) {
                    setErrorInicio(
                        "No fue posible verificar la sesion. Comprueba que Spring Boot este funcionando."
                    );
                }
            } finally {
                if (activo) {
                    setCargando(false);
                }
            }
        }

        verificarSesion();

        return () => {
            activo = false;
        };
    }, []);

    useEffect(() => {
        if (!sesion) {
            return;
        }

        const expiracion = obtenerExpiracionToken();

        if (!expiracion) {
            cerrarSesion();
            return;
        }

        const tiempoRestante = Math.max(
            0,
            expiracion - Date.now()
        );

        const temporizador = setTimeout(() => {
            cerrarSesion();
            setSesion(null);
        }, Math.min(tiempoRestante, 2147483647));

        return () => clearTimeout(temporizador);
    }, [sesion]);

    function usuarioInicioSesion(usuario) {
        setSesion(usuario);
    }

    function usuarioCerroSesion() {
        cerrarSesion();
        setSesion(null);
    }

    if (cargando) {
        return (
            <div className="container py-5 text-center">
                <div
                    className="spinner-border"
                    role="status"
                    aria-label="Verificando sesion"
                />
                <p className="mt-3">
                    Verificando sesion...
                </p>
            </div>
        );
    }

    if (errorInicio) {
        return (
            <div className="container py-5">
                <div className="alert alert-warning" role="alert">
                    {errorInicio}
                </div>
                <button
                    className="btn btn-dark"
                    onClick={() => window.location.reload()}
                >
                    Reintentar
                </button>
            </div>
        );
    }

    return (
        <Routes>
            <Route
                element={
                    <LayoutPrincipal
                        sesion={sesion}
                        onLogout={usuarioCerroSesion}
                    />
                }
            >
                <Route path="/" element={<Inicio />} />
                <Route path="/productos" element={<Productos />} />
                <Route
                    path="/productos/:codigo"
                    element={<DetalleProducto />}
                />
                <Route path="/contacto" element={<Contacto />} />
                <Route path="/ubicaciones" element={<Ubicaciones />} />
                <Route path="/carrito" element={<Carrito />} />
                <Route path="/registro" element={<Registro />} />
                <Route
                    path="/login"
                    element={<Login onLogin={usuarioInicioSesion} />}
                />

                <Route
                    path="/mi-cuenta"
                    element={
                        <RutaProtegida sesion={sesion}>
                            <MiCuenta sesion={sesion} />
                        </RutaProtegida>
                    }
                />

                <Route
                    path="/admin"
                    element={
                        <RutaProtegida
                            sesion={sesion}
                            rolesPermitidos={["ADMIN"]}
                        >
                            <PanelAdmin />
                        </RutaProtegida>
                    }
                />

                <Route
                    path="/admin/productos"
                    element={
                        <RutaProtegida
                            sesion={sesion}
                            rolesPermitidos={["ADMIN"]}
                        >
                            <GestionProductos />
                        </RutaProtegida>
                    }
                />

                <Route
                    path="/vendedor"
                    element={
                        <RutaProtegida
                            sesion={sesion}
                            rolesPermitidos={["ADMIN", "VENDEDOR"]}
                        >
                            <PanelVendedor />
                        </RutaProtegida>
                    }
                />

                <Route
                    path="/checkout"
                    element={
                        <RutaProtegida
                            sesion={sesion}
                            rolesPermitidos={["CLIENTE"]}
                        >
                            <Checkout sesion={sesion} />
                        </RutaProtegida>
                    }
                />

                <Route
                    path="/mis-pedidos"
                    element={
                        <RutaProtegida
                            sesion={sesion}
                            rolesPermitidos={["CLIENTE"]}
                        >
                            <MisPedidos sesion={sesion} />
                        </RutaProtegida>
                    }
                />

                <Route
                    path="/admin/pedidos"
                    element={
                        <RutaProtegida
                            sesion={sesion}
                            rolesPermitidos={["ADMIN", "VENDEDOR"]}
                        >
                            <GestionPedidos />
                        </RutaProtegida>
                    }
                />

                <Route
                    path="/admin/usuarios"
                    element={
                        <RutaProtegida
                            sesion={sesion}
                            rolesPermitidos={["ADMIN"]}
                        >
                            <GestionUsuarios sesion={sesion} />
                        </RutaProtegida>
                    }
                />

                <Route
                    path="/admin/reportes"
                    element={
                        <RutaProtegida
                            sesion={sesion}
                            rolesPermitidos={["ADMIN"]}
                        >
                            <ReportesVentas />
                        </RutaProtegida>
                    }
                />

                <Route path="*" element={<NotFound />} />
            </Route>
        </Routes>
    );
}

export default App;
