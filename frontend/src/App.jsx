import {
    useEffect,
    useState
} from "react";

import {
    Routes,
    Route
} from "react-router-dom";


import LayoutPrincipal
    from "./components/LayoutPrincipal";

import RutaProtegida
    from "./components/RutaProtegida";


import Inicio
    from "./pages/Inicio";

import Productos
    from "./pages/Productos";

import DetalleProducto
    from "./pages/DetalleProducto";

import Contacto
    from "./pages/Contacto";

import Carrito
    from "./pages/Carrito";

import Registro
    from "./pages/Registro";

import Login
    from "./pages/Login";

import MiCuenta
    from "./pages/MiCuenta";

import PanelAdmin
    from "./pages/PanelAdmin";

import NotFound
    from "./pages/NotFound";


import {
    obtenerSesion,
    cerrarSesion
} from "./services/authService";

import {
    inicializarAdministrador
} from "./services/usuariosService";

import {
    inicializarProductos
} from "./services/productosService";

import GestionProductos
    from "./pages/GestionProductos";

import Checkout
    from "./pages/Checkout";



function App() {

    const [sesion, setSesion] =
        useState(obtenerSesion());


    useEffect(() => {

    inicializarAdministrador();

    inicializarProductos();

    }, []);


    function usuarioInicioSesion(usuario) {

        setSesion(usuario);

    }


    function usuarioCerroSesion() {

        cerrarSesion();

        setSesion(null);

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

                <Route
                    path="/"
                    element={<Inicio />}
                />


                <Route
                    path="/productos"
                    element={<Productos />}
                />


                <Route
                    path="/productos/:codigo"
                    element={<DetalleProducto />}
                />


                <Route
                    path="/contacto"
                    element={<Contacto />}
                />


                <Route
                    path="/carrito"
                    element={<Carrito />}
                />


                <Route
                    path="/registro"
                    element={<Registro />}
                />


                <Route
                    path="/login"
                    element={
                        <Login
                            onLogin={usuarioInicioSesion}
                        />
                    }
                />


                <Route
                    path="/mi-cuenta"
                    element={

                        <RutaProtegida
                            sesion={sesion}
                        >

                            <MiCuenta
                                sesion={sesion}
                            />

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
                    path="/checkout"
                    element={

                        <RutaProtegida
                            sesion={sesion}
                        >

                            <Checkout
                                sesion={sesion}
                            />

                        </RutaProtegida>

                    }
                />


                <Route
                    path="*"
                    element={<NotFound />}
                />

            </Route>

        </Routes>

    );

}


export default App;