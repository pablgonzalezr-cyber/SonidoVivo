import { Outlet } from "react-router-dom";

import Header from "./Header";
import Navbar from "./Navbar";
import Footer from "./Footer";


function LayoutPrincipal() {

    return (

        <div className="layout-principal">

            <Header />

            <Navbar />


            <main className="contenido-principal">

                <Outlet />

            </main>


            <Footer />

        </div>

    );

}


export default LayoutPrincipal;