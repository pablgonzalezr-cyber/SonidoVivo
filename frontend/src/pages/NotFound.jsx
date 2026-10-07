import { Link } from "react-router-dom";


function NotFound() {

    return (

        <section className="container py-5 text-center">

            <h2 className="display-3 fw-bold">

                404

            </h2>


            <p className="lead">

                La página que buscas no existe.

            </p>


            <Link
                to="/"
                className="btn btn-dark"
            >

                Volver al inicio

            </Link>

        </section>

    );

}


export default NotFound;