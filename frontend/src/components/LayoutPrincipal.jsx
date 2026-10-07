import Header from "./Header";
import Navbar from "./Navbar";
import Footer from "./Footer";


function LayoutPrincipal({ children }) {

    return (

        <div className="layout-principal">

            <Header />

            <Navbar />


            <main className="contenido-principal">

                {children}

            </main>


            <Footer />

        </div>

    );

}


export default LayoutPrincipal;