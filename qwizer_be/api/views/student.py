from django.contrib.auth import authenticate, login, logout
from django.db.models import F,Q
from rest_framework import viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.models import EsAlumno, User


class StudentsViewSet(viewsets.ViewSet):
    permission_classes=[]

    def list(self,request):
        """
        GET /estudiantes
        """
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

    def retrieve(self,request, pk):
        """
        GET /estudiantes/{id_asignatura}
        """
        content = {}
        # comporbar que es alumno
        if str(request.user.role) != "student":
            usuarios_asignatura = EsAlumno.objects.get_by_asignatura(id_asignatura=pk)
            alumnos = []
            for alumno in usuarios_asignatura:  # TODO cambiar los atributos en los modelos no es un idAlumno es el alumno como tal
                alumnos.append({"id": alumno.idAlumno.id, "nombre": alumno.idAlumno.first_name, "apellidos": alumno.idAlumno.last_name})

            content["alumnos"] = alumnos
            print(content)

            return Response(content)
        else:
            return Response("")

    @action(methods=["GET"], detail=True)
    def disponibles(self,request, pk):
        """
        GET /estudiantes/{id_asignatura}/disponibles
        """
        content = {}
        if str(request.user.role) != "student":
            # TODO asegurarse de que es correcta la query
            usuarios_asignatura = User.objects.filter(role='student').exclude(esalumno__idAlumno_id=F("id"),esalumno__idAsignatura=pk)
            alumnos = []

            for alumno in usuarios_asignatura:
                alumnos.append({"id": alumno.id, "nombre": alumno.first_name, "apellidos": alumno.last_name})

            content["alumnos"] = alumnos
            print(content)

            return Response(content)
        else:
            return Response("")