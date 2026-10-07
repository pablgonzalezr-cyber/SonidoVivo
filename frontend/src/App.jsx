import { Routes, Route } from "react-router-dom";

import LayoutPrincipal from "./components/LayoutPrincipal";

import Carrito from "./pages/Carrito";

import Inicio from "./pages/Inicio";
import Productos from "./pages/Productos";
import DetalleProducto from "./pages/DetalleProducto";
import Contacto from "./pages/Contacto";
import NotFound from "./pages/NotFound";


function App() {

    return (

        <Routes>

            <Route element={<LayoutPrincipal />}>

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
                    path="*"
                    element={<NotFound />}
                />

                <Route
                    path="/carrito"
                    element={<Carrito />}
                />

            </Route>

        </Routes>

    );

}


export default App;
