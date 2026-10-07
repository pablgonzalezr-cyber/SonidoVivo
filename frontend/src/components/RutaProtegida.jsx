import {
    Navigate
} from "react-router-dom";


function RutaProtegida({
    sesion,
    rolesPermitidos = [],
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


    if (
        rolesPermitidos.length > 0 &&
        !rolesPermitidos.includes(sesion.rol)
    ) {

        return (
            <Navigate
                to="/"
                replace
            />
        );

    }


    return children;

}


export default RutaProtegida;