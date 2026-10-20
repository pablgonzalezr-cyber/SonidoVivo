Especificación de Requisitos del Software (ERS)

SONIDO VIVO | VERSIÓN 2 | EVALUACIÓN PARCIAL 2

1. Identificación del proyecto
Dato	Información
Proyecto	Sonido Vivo — Tienda de instrumentos y equipos musicales
Asignatura y contexto	DSY1104 · Desarrollo Full Stack II · Forma B
Integrantes	Pablo González y Gabriel Chodil
Versión del documento	ERS V2 — Frontend React (EP2), octubre de 2026
Sección / repositorio	006D / SonidoVivo en GitHub
2. Propósito y alcance

Definir los requisitos de la tienda online Sonido Vivo, orientada a consultar productos, administrar inventario y registrar pedidos.

Esta versión corresponde al frontend construido con React y datos simulados. Los módulos funcionan localmente en el navegador; no existe todavía integración con servicios de producción.

3. Actores y permisos
Actor	Funciones principales
Cliente	Consultar catálogo, gestionar carrito, confirmar pedidos y revisar sus compras.
Vendedor	Consultar productos, actualizar stock y gestionar estados de pedidos.
Administrador	Gestionar usuarios, productos, inventario y pedidos; consultar reportes.
4. Requisitos funcionales

Los requisitos RF-01 a RF-18 describen funcionalidades implementadas o simuladas en la versión EP2.

ID	Actor	Requisito
RF-01	Público	Visualizar el catálogo con información y disponibilidad de productos.
RF-02	Público	Buscar productos por texto y filtrarlos por categoría.
RF-03	Público	Consultar ficha de producto con descripción, precio e imagen.
RF-04	Público	Registrar consultas en un formulario validado; se muestra confirmación local.
RF-05	Público	Visualizar ubicaciones referenciales en un mapa interactivo.
RF-06	Cliente	Registrar una cuenta validando nombre, correo, contraseña y duplicados.
RF-07	Todos	Iniciar/cerrar sesión y restringir vistas según el rol del usuario.
RF-08	Cliente	Agregar o quitar productos del carrito, revisar cantidades y calcular el total.
RF-09	Cliente	Mantener un carrito diferenciado por usuario y recuperar el del invitado al iniciar sesión.
RF-10	Cliente	Confirmar pedidos mediante despacho o retiro, validando dirección si corresponde.
RF-11	Cliente	Registrar el pedido con precio/stock vigentes y descontar el inventario disponible.
RF-12	Cliente	Consultar el historial de pedidos asociado a su propia cuenta.
RF-13	Administrador / Vendedor	Consultar pedidos y actualizar su estado de procesamiento.
RF-14	Administrador	Crear, consultar, editar y eliminar productos del catálogo.
RF-15	Administrador / Vendedor	Consultar y modificar existencias mediante controles de stock.
RF-16	Administrador	Crear y editar usuarios, asignar roles y activar o desactivar cuentas.
RF-17	Administrador	Consultar reportes de ventas y pedidos filtrados por fechas.
RF-18	Usuario registrado	Consultar la información básica de su cuenta.
5. Requisitos no funcionales
ID	Requisito
RNF-01	Interfaz adaptable a dispositivos móviles (desde 360 px), tabletas (desde 768 px) y escritorio (desde 1280 px).
RNF-02	Aplicación de página única en React, con React Router, componentes reutilizables y estado de interfaz.
RNF-03	Validaciones de datos y mensajes visibles de éxito o error en operaciones y formularios.
RNF-04	Uso de Bootstrap y estilos CSS para navegación y presentación coherentes.
RNF-05	Pruebas de unidades y componentes mediante Vitest y React Testing Library.
RNF-06	Arranque reproducible del frontend mediante npm install y npm run dev.
6. Reglas de negocio
RN-01. No se confirma una compra si el carrito está vacío o no hay stock suficiente.
RN-02. Los pedidos usan el precio vigente del catálogo y descuentan existencias al confirmarse.
RN-03. El despacho requiere dirección válida; el retiro en tienda no la solicita.
RN-04. Las rutas administrativas y de cliente se muestran según la sesión y el rol.
RN-05. No se puede desactivar al último administrador activo ni desactivar la propia cuenta desde su panel.
7. Alcance pendiente y continuidad

La persistencia se simula con localStorage y es específica del navegador; la autenticación y los permisos actuales se verifican en el frontend.

No se implementan aún backend Spring Boot, base de datos MySQL, API REST real, JWT, pasarela de pago ni despliegue productivo.

La integración, seguridad y persistencia reales corresponden a etapas posteriores del proyecto semestral.

8. Criterios de verificación

Los requisitos se verifican mediante:

Navegación funcional por roles.
Operaciones sobre datos simulados.
Pruebas automatizadas del frontend.

La ejecución de las pruebas y los porcentajes de cobertura se documentan por separado en el Informe de Cobertura y Análisis del Testing de la EP2.