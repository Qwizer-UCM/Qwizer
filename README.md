# Índice

- [Qwizer](#qwizer)
- [Ejecución con docker](#ejecución-con-docker)
- [Ejecución manual](#ejecución-manual)
  - [Djagno](#django)
  - [React](#react)
- [Links de interés](#links-de-interés)

# Qwizer

 TFG : Aplicación web progresiva para la realización de cuestionarios
 
 Qwizer es una aplicación web cuya finalidad es permitir a un alumno realizar cuestionarios. Lo que destaca de esta aplicación web con respecto a otras de este tipo, como Moodle, es que esta es progresiva, es decir, funciona incluso cuando no hay conexión a internet; aunque la funcionalidad esta limitada a realizar cuestionarios de manera *offline*. Cuando el usuario realice un cuestionario de manera *offline*, se le generará un código QR de sus respuestas, el cual deberá mostrar al profesor. Una vez el usuario vuelva a tener conexión a internet, las respuestas del cuestionario se enviará automáticamente. Se pueden distinguir tres grupos de usuarios para la aplicación:
 
- **Alumnos:** Los alumnos tienen la posibilidad de realizar los cuestionarios de las asignaturas para las que estén matriculados. Una vez enviadas las 	respuestas, el cuestionario se corrige automáticamente y el alumno podrá ver su cuestionario corregido, además de su nota.
- **Profesores:** Los profesores cuentan con la posibilidad de matricular alumnos en cualquiera de las asignaturas que ellos impartan. Con respecto a los cuestionarios, pueden añadirlos a estas asignaturas tanto haciendo uso de una página de la propia aplicación como subiendo los cuestionarios mediante un fichero. También pueden revisar las respuestas dadas por un alumno, así como las notas que ha obtenido. Por último tienen acceso a un banco de preguntas, al cual pueden añadir nuevas preguntas mediante un fichero y también descargar las preguntas para su posterior uso.
- **Administradores:** Mediante el panel de control tienen la posibilidad de crear asignaturas, dar de alta usuarios (tanto alumnos como profesores), matricular alumnos en una asignatura y asignar profesores a una asignatura.

La aplicación tiene un diseño adaptativo, lo que permite que se visualice bien, tanto en pantallas de ordenadores, como en la de dispositivos móviles.

# Ejecución con docker

   Seguir las instrucciones descritas en [Qwizer & Docker Compose](.docker/README.md)

# Ejecución manual

Requisitos.

```
- Base de datos PostgreSQL 15.2
- Python 3.11
- Node 18.7.0
```

## Django

Para poder usar django necesitarás tener python instalado e instalar pipenv con el siguiente comando `pip install pipenv`. A continuación habria que instalar las librerias necesarias con `pipenv install`.

Después se podrá arrancar el sevidor mediante el comando `python manage.py runserver`. Este comando debe de ser lanzado desde la carpeta `qwizer-be` del proyecto. **CUIDADO** de no hacerlo desde otra carpeta porque si no nos descargará todas las dependencias necesarias para ejecutar la aplicación.

**IMPORTANTE**: Si es el primer arranque, antes de ejecutar  `python manage.py runserver`  debes ejecutar `python manage.py makemigrations` y `python manage.py migrate`. Con esto se generarán las tablas en la base de datos que creaste con anterioridad.

**Creación de un usuario:** En la consola de python, antes de arrancar el servidor, ejecuta `python manage.py createsuperuser`. Los posibles roles son: `teacher, student`. También se pueden crear usuarios mediante el uso de la API, mediante la dirección `http://localhost:8000/api/register`.  En este caso sí que será necesario ejecutar el servidor.
Además si lo desea puede hacer uso del fichero  `startup.py` , ejecutandolo en consola con el comando `python startup.py`, que le generará de manera automática un profesor/admin con el correo  `root@root.com`  y contraseña  `root` .

## React

En primer lugar necesitarás instalar [Node.js](https://nodejs.org/es/). Tras ello deberás ir a la carpeta` ./qwizer-fe ` y ejecutar `npm install`.
Tras ejecutar la instalación deberás usar los comandos `npm run build` y `npm run preview`.

# Links de interés

1. Página web de qwizer: <https://localhost>
2. Panel de administración de django: <https://localhost/admin>
3. Documentación de la api: <https://localhost/swagger> o <https://localhost/redoc> 

# **Funcionalidades:**

- **Alumnos:**  
   - Pueden ver las asignaturas en las que están matriculados.
   - Pueden ver los cuestionarios que tienen para una asignatura.
   - Pueden descargar cuestionarios para su posterior realización.
   - Pueden revisar los cuestionarios realizados y ver su nota.
 
- **Profesores:** 
   - Pueden ver las asignaturas que imparten.
   - Pueden matricular estudiantes en las asignaturas que imparten.
   - Pueden ver los cuestionarios que tienen para una asignatura.
   - Pueden descargar cuestionarios para su posterior realización.
   - Pueden revisar los cuestionarios realizados y ver su nota.
   - Pueden revisar los cuestionarios de sus estudiantes y ver su nota.
   - Banco de Preguntas:
      - Visualización, edición y eliminación de preguntas.
      - Descarga de las preguntas en un fichero en formato YAML.
   - Subir preguntas al banco de preguntas con un fichero en formato YAML.
   - Subir cuestionarios con un fichero en formato YAML.
   - Creación de cuestionarios a través de la interfaz web.
   
- **Administradores:** 
   - Panel de administración de Django para gestionar la base de datos.
   
- **Funcionamiento _offline_:**
   - Permite que los usuarios puedan realizar los cuestionarios que se hayan descargado de manera _offline_.
   - Generación del QR que se deberá mostrar al profesor.
   - Envío de respuestas automáticamente cuando el usuario recupere la conexión.
   - El profesor puede comprobar la integridad de las respuestas enviadas.
  

