from django.contrib.auth import authenticate, login, logout
from django.db.models import F,Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.models import EsAlumno, User

# TODO no se usan
# path("login", user.app_login, name="login"),
# path("logout", user.app_logout, name="logout"),
# path("register", user.registro, name="register"),
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_students(request):
    content = {}
    # comporbar que es alumno
    if str(request.user.role) != "student":
        usuarios = User.objects.get_students()
        alumnos = []
        for alumno in usuarios:
            alumnos.append({"id": alumno.id, "nombre": alumno.first_name, "apellidos": alumno.last_name})

        content["alumnos"] = alumnos

        return Response(content)
    else:
        return Response("")


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_studentsFromAsignatura(request, idAsignatura):
    content = {}
    # comporbar que es alumno
    if str(request.user.role) != "student":
        usuariosAsignatura = EsAlumno.objects.filter(idAsignatura=idAsignatura)
        alumnos = []
        for alumno in usuariosAsignatura:  # TODO cambiar los atributos en los modelos no es un idAlumno es el alumno como tal
            alumnos.append({"id": alumno.idAlumno.id, "nombre": alumno.idAlumno.first_name, "apellidos": alumno.idAlumno.last_name})

        content["alumnos"] = alumnos
        print(content)

        return Response(content)
    else:
        return Response("")


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_studentsForEnroll(request, idAsignatura):
    content = {}
    if str(request.user.role) != "student":
        # TODO asegurarse de que es correcta la query
        usuariosAsignatura = User.objects.filter(role='student').exclude(esalumno__idAlumno_id=F("id"),esalumno__idAsignatura=idAsignatura)
        alumnos = []

        for alumno in usuariosAsignatura:
            alumnos.append({"id": alumno.id, "nombre": alumno.first_name, "apellidos": alumno.last_name})

        content["alumnos"] = alumnos
        print(content)

        return Response(content)
    else:
        return Response("")


@api_view(["POST"])
def app_login(request):
    """
    {"email": "admin@admin.com", "password": "admin"}
    """
    return_value = ""
    info = request.data
    correo = info["email"]
    print(correo)
    contra = info["password"]
    print(contra)
    user = authenticate(username=correo, password=contra)
    print(user)
    if user is not None:
        login(request, user)
        token, _ = Token.objects.get_or_create(user=user)
        tokenvalue = "Token" + " " + token.key
        return_value = {
            "respuesta": "ok login",
            "username": correo,
            "token": token.key,
            "rol": user.role,
            "token": tokenvalue,
            "id": user.id,
        }

        # Redirect to a success page.
    else:
        # Return an 'invalid login' error message.
        return_value = {"respuesta": "invalid login"}

    return Response(return_value)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def app_logout(request):
    logout(request)
    return Response("Logged out")


# registro
@api_view(["POST"])
def registro(request):
    """
    {
        "email": "profesor@ucm.es",
        "first_name": "Maria",
        "last_name": "Perez",
        "password": "1234",
        "role": "teacher"
    }

    """
    if request.user.is_authenticated:
        return Response("Ya estas registrado")
    info = request.data
    kwargs = {"role": info["role"]}
    user = User.objects.create_user(info["email"], info["first_name"], info["last_name"], info["password"], **kwargs)

    return Response("Registrado correctamente intenta logearte")
