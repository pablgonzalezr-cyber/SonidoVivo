import { useState } from "react";
import {
    Routes,
    Route
} from "react-router-dom";

import LayoutPrincipal
    from "./components/LayoutPrincipal";

import Inicio from "./pages/Inicio";
import Productos from "./pages/Productos";
import DetalleProducto from "./pages/DetalleProducto";
    
import Contacto from "./pages/Contacto";
import Carrito from "./pages/Carrito";
import Registro from "./pages/Registro";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

import {
    obtenerSesion,
    cerrarSesion
} from "./services/authService";


function App() {

    const [sesion, setSesion] =
        useState(obtenerSesion());


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
                    path="*"
                    element={<NotFound />}
                />

            </Route>

        </Routes>

    );

}


export default App;