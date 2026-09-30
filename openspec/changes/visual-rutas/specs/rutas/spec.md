# Rutas Specification

## Purpose
Esta visual será el punto de entrada para consultar y procesar las facturas agrupadas por ruta. Se enfoca en reutilizar el sistema de diseño actual sin introducir nuevas lógicas de backend complejas por el momento, sirviendo de base estructural.

## Requirements

### Requirement: REQ-RUTAS-01-VisualizarGridRutas
La aplicación MUST mostrar las rutas en un grid de tarjetas responsive, adaptándose correctamente desde resoluciones desktop hasta dispositivos móviles.

#### Scenario: SC-RUTAS-01-01-VisualizarDesktop
Given que el usuario accede a la vista de Rutas en un dispositivo desktop
When la vista se carga
Then se MUST mostrar un grid multidimensional de tarjetas con las rutas disponibles.

#### Scenario: SC-RUTAS-01-02-VisualizarMovil
Given que el usuario accede a la vista de Rutas en un dispositivo móvil
When la vista se carga
Then se MUST mostrar las tarjetas de rutas adaptadas al ancho de la pantalla, típicamente en una sola columna.

### Requirement: REQ-RUTAS-02-ContenidoTarjetaRuta
Cada tarjeta de ruta MUST exhibir de manera jerárquica: el nombre de la ruta, cantidad de clientes asociados, cantidad de facturas disponibles (si está disponible), el estado de la ruta/lote (cuando aplique) y la acción principal "Ver ruta".

#### Scenario: SC-RUTAS-02-01-VerDatosTarjeta
Given que existen rutas disponibles para mostrar
When el usuario visualiza una tarjeta de ruta
Then la tarjeta MUST mostrar su nombre, número de clientes, número de facturas (si el dato está presente) y su estado actual.
And la tarjeta MUST contener un botón o enlace con el texto "Ver ruta".

### Requirement: REQ-RUTAS-03-NavegacionDetalle
La acción de "Ver ruta" MUST navegar a la vista de detalle de la ruta seleccionada.

#### Scenario: SC-RUTAS-03-01-NavegarAlDetalle
Given que el usuario visualiza una tarjeta de ruta
When el usuario hace clic en el botón "Ver ruta"
Then la aplicación MUST redirigir al usuario a la estructura de navegación correspondiente al detalle de esa ruta.

### Requirement: REQ-RUTAS-04-ReutilizacionDiseno
La nueva visual MUST reutilizar los componentes, tipografía, espaciado y estilos del proyecto, basándose en los patrones de la visual actual de Facturas, y NO MUST introducir colores hardcodeados ni clases que contradigan el sistema de diseño existente.

#### Scenario: SC-RUTAS-04-01-UsoDeComponentesExistentes
Given que se construye la vista de Rutas
When se aplican los estilos visuales
Then la interfaz MUST utilizar únicamente los componentes y variables de diseño globales ya existentes.

### Requirement: REQ-RUTAS-05-UsoDeDatosMock
La visual MUST aislar la obtención de datos y, en caso de no existir un endpoint real, MUST utilizar datos mock únicamente para facilitar la visualización del diseño.

#### Scenario: SC-RUTAS-05-01-CargarDatosMock
Given que el endpoint de rutas aún no está disponible
When el frontend solicita la información de las rutas
Then el sistema MUST proporcionar un conjunto de datos mock estructurados.
And estos datos MUST estar aislados para permitir su fácil reemplazo futuro por la integración real.
