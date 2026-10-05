# Gestion de eventos

Aplicacion web SaaS para planificar y administrar eventos desde un unico lugar. El sistema permite crear eventos, organizar invitados, administrar proveedores, controlar el presupuesto, armar un cronograma y generar una invitacion digital publicable.

## Integrantes

- Camila Zalcman
- Victoria Villalba

## Descripcion del proyecto

El objetivo del proyecto es centralizar la organizacion de un evento y facilitar el seguimiento de sus tareas principales. Cada usuario autenticado puede administrar sus propios eventos y consultar la informacion relacionada desde un panel privado.

La aplicacion esta pensada para eventos sociales o corporativos y permite compartir una invitacion publica mediante un enlace. Las personas invitadas pueden consultar la informacion del evento y confirmar su asistencia desde esa invitacion.

## Funcionalidades principales

- Registro e inicio de sesion mediante Firebase Authentication.
- Creacion, edicion y eliminacion de eventos.
- Configuracion de datos generales, fecha, ubicacion y portada del evento.
- Administracion de invitados y seguimiento del estado de confirmacion.
- Carga y organizacion de proveedores asociados al evento.
- Registro y seguimiento de gastos y presupuesto.
- Creacion de un cronograma con actividades y horarios del evento.
- Personalizacion de invitaciones con estilos, tipografias, colores y musica.
- Generacion de enlaces publicos para compartir las invitaciones.
- Confirmacion de asistencia desde la invitacion publica.
- Panel de administracion para consultar estadisticas generales.
- Separacion de la informacion por usuario autenticado.

## Tecnologias utilizadas

- Next.js 16 con App Router.
- React 19.
- JavaScript.
- Tailwind CSS.
- Firebase Authentication.
- Firebase Admin SDK.
- Cloud Firestore.
- Firebase Storage para la carga opcional de imagenes.
- Lucide React para los iconos de la interfaz.

## Arquitectura

El proyecto utiliza el App Router de Next.js. Las paginas se organizan dentro de la carpeta `app` y se separan las rutas publicas, las rutas de autenticacion, el panel privado y las rutas de invitaciones.

- Las rutas privadas requieren una sesión valida.
- La sesion se administra mediante cookies HTTP-only y Firebase Admin SDK.
- Los datos se almacenan en Cloud Firestore.
- Las operaciones de escritura se realizan mediante Server Actions y rutas de API.
- Los componentes de cliente se utilizan cuando se necesita interactividad, formularios o estado local.
- Cada usuario solo puede acceder a los eventos y datos que le pertenecen.

## Estructura principal:

app/
  (public)/       Página principal y vistas públicas
  (auth)/         Inicio de sesión
  (app)/          Panel privado y funcionalidades del usuario
  (guest)/        Vista pública para invitados
  api/            Sesiones y carga de archivos

components/      Componentes reutilizables de la interfaz
lib/             Lógica de Firebase, eventos, usuarios y validaciones
public/          Imágenes y recursos públicos

## Requisitos

- Node.js compatible con Next.js 16.
- Yarn.
- Un proyecto de Firebase.
- Firebase Authentication habilitado.
- Cloud Firestore habilitado.
- Credenciales del Firebase Admin SDK.

Firebase Storage es opcional y se utiliza para cargar imágenes desde la aplicación.

## Instalación y ejecución

1. Instalar Yarn si no esta disponible y luego instalar las dependencias:

```bash
yarn install
```

2. Configurar las variables de entorno en un archivo `.env` en la raiz del proyecto. Se deben completar las credenciales de Firebase Web y Firebase Admin SDK. El archivo `.env` no debe subirse al repositorio.

3. Ejecutar el servidor de desarrollo:

```bash
yarn dev
```

4. Abrir la aplicacion en:

```text
http://localhost:3000
```

## Scripts disponibles

```bash
yarn dev          # Inicia el servidor de desarrollo
yarn lint         # Ejecuta el analisis de codigo
yarn build        # Genera la build de produccion
yarn start        # Inicia la aplicacion en modo produccion
```

## Flujo de uso

1. La persona usuaria se registra o inicia sesión.
2. Desde el dashboard crea un evento y completa sus datos principales.
3. Agrega invitados, proveedores, gastos y actividades al cronograma.
4. Personaliza la invitación digital.
5. Comparte el enlace público con las personas invitadas.
6. Consulta las confirmaciones y actualiza la organización del evento desde el dashboard.

## Seguridad y privacidad

La autenticación se realiza con Firebase Authentication y la sesion se valida en el servidor. Las operaciones sobre eventos, invitados, proveedores, gastos y cronogramas verifican la identidad de la persona usuaria antes de leer o modificar datos.

Las invitaciones públicas utilizan un enlace para que las personas invitadas puedan consultar la informacion habilitada y responder a la invitacion sin acceder al panel privado.

## Declaración de uso de inteligencia artificial

El proyecto fue desarrollado por Camila Zalcman y Victoria Villalba. Ambas utilizamos OpenCode como herramienta de asistencia durante el proceso de desarrollo.

La inteligencia artificial se utilizó para: 

- Planificar y diseñar sistemas
- Consultar dudas tecnicas
- Analizar errores
- Proponer alternativas de implementacion
- Colaborar en la organizacion y generación del codigo
- Redactar parte de la documentación del proyecto. 

Las sugerencias obtenidas fueron revisadas, adaptadas e integradas manualmente de acuerdo con las necesidades de la aplicación.

Las decisiones sobre el diseño, la arquitectura, las funcionalidades, la integración con Firebase, las pruebas y la validación final del sistema fueron tomadas y realizadas por las integrantes del equipo. OpenCode fue utilizado como apoyo y no reemplazo el análisis, la comprensión ni la responsabilidad del equipo sobre el código entregado.
