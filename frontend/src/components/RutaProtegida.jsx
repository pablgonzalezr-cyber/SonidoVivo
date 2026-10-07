import {
    Navigate
} from "react-router-dom";


function RutaProtegida({
    sesion,
    children
}) {

    if (!sesion) {

        return (
            <Navigate
                to="/login"
                replace
            />
        );

    }


    return children;

}


export default RutaProtegida;