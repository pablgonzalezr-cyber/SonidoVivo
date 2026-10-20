# Sonido Vivo — Informe de cobertura y análisis del testing

**Asignatura:** Desarrollo Full Stack II (DSY1104)  
**Evaluación:** Parcial 2 — 2026-2  
**Proyecto:** Forma B — Tienda Sonido Vivo  
**Integrantes:** Pablo González y Gabriel Chodil  
**Fecha del informe:** 20/10/2026  
**Versión evaluada:** Frontend final de Evaluación Parcial 2 · 20-10-2026 

## 1. Objetivo

Evaluar el comportamiento del frontend React de Sonido Vivo mediante pruebas
unitarias y de componentes, identificar los módulos verificados y analizar la
cobertura del código de acuerdo con el alcance de la Evaluación Parcial 2.

## 2. Entorno de pruebas

| Elemento | Herramienta o versión |
| --- | --- |
| Frontend | React + Vite + JavaScript |
| Framework de pruebas | Vitest |
| Pruebas de interfaz | React Testing Library |
| DOM simulado | jsdom |
| Aserciones de interfaz | @testing-library/jest-dom |
| Mocks y spies | vi.mock, vi.fn y vi.mocked de Vitest |
| Cobertura | @vitest/coverage-v8 (V8) |
| Sistema y Node.js | Windows 11 y Node.js v24.21.0 |
| npm | 12.2.0 |

Se utilizan Vitest y React Testing Library conforme a la adaptación técnica
indicada por el docente para esta ejecución de DSY1104.

## 3. Comandos para reproducir

En la carpeta `frontend`:

```bash
npm install
npm test
npm run test:watch
npm run test:coverage
npm run build
```

El comando `npm run test:watch` mantiene las pruebas activas mientras se
modifica el código. El reporte HTML de cobertura se genera en
`frontend/coverage/index.html`.

## 4. Inventario de pruebas

| Archivo | Casos esperados | Qué se verifica |
| --- | ---: | --- |
| `validaciones.test.js` | 5 | Nombre, correo, mensaje y contraseña |
| `inventario.test.js` | 4 | Carrito, límite de stock y pedidos |
| `Login.test.jsx` | 3 | Errores y acceso mediante formulario |
| `usuariosAdmin.test.js` | 5 | CRUD de usuarios, roles y cuentas desactivadas |
| `pedidosEntrega.test.js` | 5 | Despacho, retiro, precios y restricciones |
| `reportesVentas.test.js` | 4 | Totales, estados y filtro por fechas |
| `RutaProtegida.test.jsx` | 4 | Control de rutas según autenticación y rol |
| `ProductoCard.test.jsx` | 3 | Datos visibles, enlace y fallback de foto |
| `Productos.test.jsx` | 4 | Tarjetas, búsqueda, categorías y sin resultados |
| `Checkout.test.jsx` | 4 | Opciones de entrega, confirmación y errores |
| **TOTAL PREVISTO** | **41** | **Debe confirmarse con npm test** |

El total previsto surge de 30 pruebas existentes y 11 añadidas en el commit 31.
En la versión de entrega, consignar el total **realmente aprobado**.

## 5. Evidencia de ejecución

- Fecha y hora: **[20/10/2026 17:16]**.
- Comando: `npm test`.
- Archivos de prueba aprobados: **13**.
- Pruebas aprobadas: **59**.
- Pruebas fallidas: **0**.
- Resultado de `npm run build`: **Aprobado. Compilación de producción exitosa en 712 ms, con una advertencia por un archivo JavaScript superior a 500 kB después de la minificación.**.

**Evidencia:** .

## 6. Uso de mocks y spies

| Técnica o recurso | Archivo o módulo | Finalidad / análisis técnico |
| --- | --- | --- |
| `vi.mock()` | `Productos.test.jsx` · `productosService` | Proporcionar un catálogo controlado para comprobar búsqueda, filtros y ausencia de resultados. |
| `vi.mock()` | `Checkout.test.jsx` · `carritoService` y `pedidosService` | Simular compras satisfactorias y fallidas, verificando el vaciado del carrito o la conservación del estado. |
| `vi.mock()` | `reportesVentas.test.js` · `pedidosService` | Controlar pedidos, estados y fechas para comprobar cálculos y agrupaciones de reportes. |
| `vi.mock()` | `Registro.test.jsx` · `usuariosService` | Simular un correo existente y verificar el registro de un cliente válido. |
| `vi.spyOn()` | `GestionProductos.test.jsx` · `window.confirm` | Simular la confirmación o cancelación de la eliminación de un producto. |
| `localStorage` | Pruebas de inventario, usuarios, carrito y gestión de productos | Preparar un estado inicial conocido, comprobar la persistencia simulada y limpiar los datos entre casos de prueba. |
| `fireEvent` | Login, Productos, Checkout, Registro, Carrito y GestiónProductos | Simular escritura, selección, clics y envío de formularios para comprobar las interacciones de la interfaz. |

- En `reportesVentas.test.js`, `vi.mock()` sustituye `obtenerPedidos` por
  datos predeterminados, para que los cálculos no dependan de pedidos reales.
- En `Productos.test.jsx`, `vi.mock()` sustituye el servicio de productos y
  permite comprobar búsquedas y categorías sobre un catálogo pequeño.
- En `Checkout.test.jsx`, se simulan `obtenerCarrito`, `vaciarCarrito` y
  `crearPedido` para verificar los parámetros y el manejo de errores sin
  modificar el inventario real.
- En `Login.test.jsx` y otros tests se utilizan funciones espía para
  comprobar acciones, por ejemplo si se llamó el callback de inicio de sesión.

Los mocks permiten aislar dependencias, repetir resultados y observar si
las interacciones producen las llamadas esperadas.

## 7. Cobertura del código

Valores obtenidos de la fila **All files** del reporte de Vitest:

| Métrica | Cobertura real |
| --- | ---: |
| Statements (sentencias) | 56,55 % |
| Branches (ramas) | 50,47 % |
| Functions (funciones) | 55,67 % |
| Lines (líneas) | 56,65 % |

### Archivos destacados

| Archivo o módulo | Porcentaje comprobado | Análisis técnico |
| --- | --- | --- |
| Carrito.jsx | 100 %  | Listado, totales, eliminación y estado vacío.  |
| ProductoCard.jsx  | 100 % | Representación del producto, navegación e imagen alternativa.  |
| RutaProtegida.jsx  | 100 %  | Acceso y redirección según autenticación/rol.  |
| Login.jsx  | 100 % | Errores de validación y acceso correcto.  |
| Productos.jsx  | 100 % | Catálogo, búsqueda, filtros y resultados vacíos.  |
| GestionProductos.jsx  | 98,71 %  | Altas, ediciones, validaciones y eliminación.  |
| Registro.jsx  | 94,28 % | Verificaciones y registro válido.  |
| Checkout.jsx  | 79,31 %  | Selección de entrega y confirmación de compra.  |
| GestionPedidos.jsx  | 0 % | Interfaz sin ejecución directa en esta suite.  |
| GestionUsuarios.jsx  | 0 % | Interfaz sin ejecución directa en esta suite.  |
| ReportesVentas.jsx  | 0 % | Página sin ejecución directa, aunque el servicio de reportes tiene tests.  |

## Análisis de resultados de las pruebas

### ¿Qué componentes o funciones quedaron mejor cubiertos?

`Carrito.jsx`, `ProductoCard.jsx`, `RutaProtegida.jsx`, `Login.jsx` y `Productos.jsx` alcanzan el 100 % de cobertura de líneas. `GestionProductos.jsx` registra 98,71 % y `Registro.jsx`, 94,28 %.

Se comprobó tanto el renderizado como la respuesta a acciones del usuario y las reglas de validación.

### ¿Qué funcionalidades presentan menor cobertura y por qué?

Las vistas de `GestionPedidos.jsx`, `GestionUsuarios.jsx` y `ReportesVentas.jsx` presentan 0 % de cobertura de líneas porque no cuentan con pruebas directas de sus interfaces dentro de la suite evaluada.

Que existan pruebas de servicios relacionados no implica que se haya ejecutado el código JSX de las páginas. También hay áreas de navegación y otras vistas sin cobertura directa.

### ¿Qué error o comportamiento inesperado fue detectado gracias a una prueba?

Los escenarios negativos permiten verificar la respuesta prevista ante errores de entrada y situaciones de negocio, como correo duplicado, contraseñas diferentes, precio o stock inválidos, falta de disponibilidad, autorización insuficiente y compra fallida.

No se consigna un defecto de producción específico sin evidencia técnica que lo respalde.

### ¿Qué prueba adicional sería conveniente implementar?

Se recomienda incorporar pruebas de componentes para `GestionPedidos.jsx`, `GestionUsuarios.jsx` y `ReportesVentas.jsx`.

Como siguiente nivel, conviene validar los flujos completos de navegación, los permisos entre roles y la actualización del inventario tras compras consecutivas.

La cobertura de ramas (50,47 %) indica que aún existen caminos condicionales que no han sido recorridos.

**Nota:** La cobertura es un indicador del alcance de ejecución; no constituye por sí sola una garantía de ausencia de defectos.

## 8. Conclusiones

La estrategia de pruebas de Sonido Vivo incorpora 59 casos automatizados distribuidos en 13 archivos. Se verifica lógica de negocio, validación de formularios, comportamiento de componentes React, control de acceso e interacciones propias del proceso de compra y de la administración de productos. 

El resultado global de cobertura es de 56,55 % en sentencias y líneas, 55,67 % en funciones y 50,47 % en ramas. Los módulos centrales examinados muestran alta ejecución automatizada, mientras que las vistas administrativas y de reportes no probadas directamente ofrecen oportunidades concretas de mejora. El uso de Vitest, React Testing Library, mocks, spies y almacenamiento simulado hace las pruebas repetibles y ayuda a identificar regresiones sin depender de un backend real. La evidencia de ejecución y de cobertura respalda el estado técnico del frontend correspondiente a la Evaluación Parcial 2. 

## 9. Evidencias anexas

- Captura de ejecución de pruebas: `evidencias/npm-test.png`.
- Captura de cobertura de código: `evidencias/cobertura.png`.
- Reporte HTML de cobertura: `frontend/coverage/index.html`.

