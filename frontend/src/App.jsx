import { Routes, Route } from "react-router-dom";

import LayoutPrincipal from "./components/LayoutPrincipal";

import Inicio from "./pages/Inicio";
import Productos from "./pages/Productos";
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
                    path="/contacto"
                    element={<Contacto />}
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