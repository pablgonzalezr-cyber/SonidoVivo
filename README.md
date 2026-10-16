# Sonido Vivo — Tienda de Instrumentos Musicales

Proyecto semestral desarrollado para la asignatura Desarrollo Full Stack II (DSY1104).

**Contexto:** Forma B — Tienda Sonido Vivo  
**Institución:** Duoc UC  
**Integrantes:** Pablo González y Gabriel Chodil  
**Etapa:** Evaluación Parcial 2 — Frontend React

## 1. Descripción del proyecto

Sonido Vivo es una aplicación web que simula una tienda de instrumentos musicales y equipos de sonido ubicada en Viña del Mar, Chile.
El sistema busca facilitar la consulta del catálogo, la gestión del inventario y la realización y seguimiento de pedidos.
Esta primera versión está desarrollada con React y utiliza almacenamiento local para simular las operaciones del negocio.

## 2. Tecnologías utilizadas

- React
- Vite
- JavaScript
- HTML5 y CSS3
- Bootstrap 5
- React Router
- Leaflet y OpenStreetMap
- localStorage
- Vitest
- React Testing Library
- Git y GitHub

## 3. Funcionalidades implementadas

### Catálogo de productos

- Visualización de productos musicales.
- Búsqueda y filtrado por categorías.
- Detalles, precios, fotografías y disponibilidad.
- Gestión administrativa de productos.
- Actualización del stock.

### Usuarios y autenticación simulada

- Registro de clientes.
- Inicio y cierre de sesión.
- Tres roles: ADMIN, VENDEDOR y CLIENTE.
- Rutas protegidas según el rol.
- Administración de usuarios y asignación de roles.
- Activación y desactivación de cuentas.

### Carrito de compras

- Agregar y eliminar productos.
- Validar cantidades disponibles.
- Mantener carritos individuales por cliente.
- Consultar precios actualizados.
- Calcular el total de la compra.

### Pedidos

- Confirmación de pedidos.
- Despacho a domicilio.
- Retiro en tienda.
- Descuento automático de inventario.
- Historial de compras por cliente.
- Gestión de estados de pedidos.
- Validaciones de stock y precios.

### Administración

- Gestión de productos.
- Gestión de usuarios.
- Gestión de pedidos.
- Reportes con filtros por fecha.
- Estadísticas de pedidos, montos y unidades.

### Ubicaciones

- Mapa interactivo desarrollado con Leaflet.
- Marcadores de ubicaciones referenciales.
- Enlaces para consultar indicaciones.

Los puntos del mapa son demostrativos y no representan
sucursales o puntos de retiro comerciales confirmados.

## 4. Roles del sistema

| Rol | Funcionalidades |
| --- | --- |
| ADMIN | Gestión de usuarios, productos, stock, pedidos y reportes |
| VENDEDOR | Control de stock y gestión de pedidos |
| CLIENTE | Catálogo, carrito, compras e historial personal |

Las restricciones de acceso se simulan en el frontend.
La seguridad real se implementará posteriormente en el backend.

## 5. Requisitos para ejecutar

Se necesita:

- Node.js compatible con la versión de Vite utilizada.
- npm.
- Navegador web moderno.
- Conexión a internet para instalar dependencias y cargar el mapa.

## 6. Instalación

Clonar el repositorio desde GitHub o descargar el proyecto.

Abrir una terminal en la carpeta principal y ejecutar:

```bash
cd frontend
npm install
```

## 7. Ejecutar la aplicación

Desde la carpeta `frontend`:

```bash
npm run dev
```

Abrir en el navegador la dirección que indique Vite,
normalmente:

http://localhost:5173

## 8. Cuentas de demostración

### Administrador

Correo: admin@sonidovivo.cl

Contraseña: admin123

### Vendedor

Correo: vendedor@sonidovivo.cl

Contraseña: vendedor123

### Cliente

Se puede crear una cuenta desde la sección Registro.

Las cuentas de administrador y vendedor se inicializan
automáticamente cuando todavía no existe una cuenta
de ese rol en el almacenamiento local.


## 9. Pruebas automatizadas

El proyecto utiliza Vitest y React Testing Library.

Para ejecutar las pruebas:

```bash
npm test
```

Para generar el reporte de cobertura:

```bash
npm run test:coverage
```

Las pruebas incluyen:

- Validaciones de formularios.
- Inicio de sesión.
- Control de inventario.
- Operaciones del carrito.
- Creación y validación de pedidos.
- Administración de usuarios.
- Tipos de entrega.
- Reportes de ventas.
- Protección de rutas por roles.

La suite contiene 30 casos de prueba automatizados.

## 10. Compilación

Para generar la versión de producción:

```bash
npm run build
```

Los archivos generados quedan en:

```text
frontend/dist/
```

Para revisar localmente la compilación:

```bash
npm run preview
```

## 11. Organización del proyecto

```text
SonidoVivo/
├── README.md
└── frontend/
    ├── public/
    │   └── imagenes/
    │       └── productos/
    ├── src/
    │   ├── assets/
    │   ├── components/
    │   ├── data/
    │   ├── pages/
    │   ├── services/
    │   ├── styles/
    │   ├── tests/
    │   ├── utils/
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── package.json
    └── vite.config.js
```

### Carpetas principales

- `components/`: componentes reutilizables.
- `pages/`: pantallas y módulos de la aplicación.
- `services/`: lógica de usuarios, productos, carrito, pedidos y reportes.
- `data/`: datos iniciales y ubicaciones demostrativas.
- `styles/`: estilos generales y diseño responsive.
- `tests/`: pruebas automatizadas.
- `utils/`: validaciones y utilidades de imágenes.
- `public/`: recursos estáticos.

## 12. Persistencia de datos

La aplicación utiliza localStorage para simular:

- Usuarios y sesiones.
- Catálogo y stock de productos.
- Carritos de compra.
- Pedidos registrados.

Los datos se almacenan en el navegador utilizado.

Por lo tanto, esta versión no sincroniza inventario,
usuarios ni pedidos entre distintos computadores.

La autenticación simulada almacena contraseñas
sin protección criptográfica y no debe utilizarse
para gestionar cuentas reales.

## 13. Alcance 

Esta versión se enfoca en:

- Frontend desarrollado con React.
- Componentes reutilizables.
- Props y estados.
- Navegación SPA.
- Diseño responsive con Bootstrap.
- Formularios y validaciones.
- CRUD simulado.
- Pruebas automatizadas.

No se han implementado todavía:

- Backend Spring Boot.
- Base de datos relacional real.
- API REST de producción.
- Autenticación mediante tokens.
- Pasarela de pagos real.
- Despliegue productivo en AWS.

Estos elementos corresponden a etapas posteriores
del desarrollo semestral.

## 14. Continuidad del proyecto

La aplicación continuará evolucionando durante la
Parcial 3 y el Examen Final Transversal.

Se contempla incorporar microservicios Spring Boot,
API REST, persistencia real y mecanismos de seguridad.

El objetivo es reutilizar el frontend existente,
integrándolo progresivamente con el backend.

## 15. Trabajo colaborativo

El desarrollo se realiza mediante Git y GitHub.

Los integrantes han contribuido mediante commits
individuales y descriptivos, permitiendo identificar
las funcionalidades implementadas y su evolución.


