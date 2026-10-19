import {
    describe,
    it,
    expect
} from "vitest";

import {
    render,
    screen,
    fireEvent
} from "@testing-library/react";

import "@testing-library/jest-dom/vitest";

import { MemoryRouter } from "react-router-dom";
import ProductoCard from "../components/ProductoCard";

const productoPrueba = {
    codigo: "GA001",
    categoria: "Guitarras Acústicas",
    nombre: "Guitarra Acústica Folk",
    marca: "Yamaha",
    modelo: "F310",
    descripcion: "Guitarra para principiantes",
    precio: 129990,
    stock: 8
};

function mostrarTarjeta(producto = productoPrueba) {
    return render(
        <MemoryRouter>
            <ProductoCard producto={producto} />
        </MemoryRouter>
    );
}

describe("Tarjeta de producto", () => {

    it("muestra nombre, marca, precio y stock", () => {

        mostrarTarjeta();

        expect(
            screen.getByRole("heading", {
                name: "Guitarra Acústica Folk"
            })
        ).toBeInTheDocument();

        expect(screen.getByText(/Yamaha/)).toBeInTheDocument();
        expect(screen.getByText(/129\.990/)).toBeInTheDocument();

        expect(
            screen.getByText((texto, elemento) =>
                elemento?.tagName === "SMALL" &&
                elemento.textContent.includes("Stock disponible: 8")
            )
        ).toBeInTheDocument();

    });

    it("ofrece un enlace al detalle del producto", () => {

        mostrarTarjeta();

        expect(
            screen.getByRole("link", { name: /ver detalle/i })
        ).toHaveAttribute("href", "/productos/GA001");

    });

    it("muestra imagen de respaldo cuando falla la principal", () => {

        mostrarTarjeta();

        const imagen = screen.getByRole("img", {
            name: /imagen del producto/i
        });

        expect(imagen).toHaveAttribute(
            "src",
            "/imagenes/productos/GA001.jpg"
        );

        fireEvent.error(imagen);

        expect(imagen).toHaveAttribute(
            "src",
            "/imagenes/productos/sin-foto.svg"
        );

    });

});
