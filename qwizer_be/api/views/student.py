from api.models import Cursa, User
from django.db.models import F
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


class StudentsViewSet(viewsets.ViewSet):
    permission_classes = []

    def list(self, request):
        """
        GET /estudiantes
        """
        content = {}
        # comporbar que es alumno
        if str(request.user.role) != User.STUDENT:
            usuarios = User.objects.get_students()
            alumnos = []
            for alumno in usuarios:
                alumnos.append({"id": alumno.id, "nombre": alumno.first_name, "apellidos": alumno.last_name})

            content["alumnos"] = alumnos

            return Response(content)
        else:
            return Response("")

    def retrieve(self, request, pk):
        """
        GET /estudiantes/{id_asignatura}
        """
        content = {}
        # comporbar que es alumno
        if str(request.user.role) != User.STUDENT:
            usuarios_asignatura = Cursa.objects.get_by_asignatura(id_asignatura=pk)
            alumnos = []
            for cursa in usuarios_asignatura:  
                alumnos.append({"id": cursa.alumno.id, "nombre": cursa.alumno.first_name, "apellidos": cursa.alumno.last_name})

            content["alumnos"] = alumnos
            print(content)

            return Response(content)
        else:
            return Response("")

    @action(methods=["GET"], detail=True)
    def disponibles(self, request, pk):
        """
        GET /estudiantes/{id_asignatura}/disponibles
        """
        content = {}
        if str(request.user.role) != User.STUDENT:
            # TODO asegurarse de que es correcta la query
            usuarios_asignatura = User.objects.filter(role="student").exclude(cursa__alumno_id=F("id"), cursa__asignatura_id=pk)
            alumnos = []

            for alumno in usuarios_asignatura:
                alumnos.append({"id": alumno.id, "nombre": alumno.first_name, "apellidos": alumno.last_name})

            content["alumnos"] = alumnos
            print(content)

            return Response(content)
        else:
            return Response("")
