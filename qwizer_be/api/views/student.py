from api.models import Cursa, User
from api.serializer import AlumnoSerializer
from django.db.models import F
from drf_spectacular.utils import (
    OpenApiParameter,
    extend_schema,
    extend_schema_view,
    inline_serializer,
)
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response


@extend_schema_view(
    list=extend_schema(
        summary="Lista de los usuarios que tienen rol de estudiante",
        responses={
            # TODO aparece una lista aunque se indique que es un unico resultado
            200: inline_serializer(
                name="listaAlumnos",
                fields={"alumnos": AlumnoSerializer(many=True)},
                many=False,
            ),
        },
    ),
    retrieve=extend_schema(
        summary="Lista de los usuarios que tienen rol de estudiante de una asignatura",
        parameters=[OpenApiParameter(name="id", type=int, location=OpenApiParameter.PATH)],
        responses={
            200: inline_serializer(
                name="alumnosAsignatura",
                fields={"alumnos": AlumnoSerializer(many=True)},
                many=False,
            ),
        },
    ),
    disponibles=extend_schema(
        summary="Lista de los usuarios que tienen rol de estudiante que no estan cursando una asignatura",
        parameters=[OpenApiParameter(name="id", type=int, location=OpenApiParameter.PATH)],
        responses={
            200: inline_serializer(
                name="alumnosSinMatricular",
                fields={"alumnos": AlumnoSerializer(many=True)},
                many=False,
            ),
        },
    ),
)
class StudentsViewSet(viewsets.ViewSet):
    permission_classes = []
    lookup_value_regex = r"\d+"

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
            usuarios_asignatura = User.objects.filter(role="student").exclude(cursa__alumno_id=F("id"), cursa__asignatura_id=pk)
            alumnos = []

            for alumno in usuarios_asignatura:
                alumnos.append({"id": alumno.id, "nombre": alumno.first_name, "apellidos": alumno.last_name})

            content["alumnos"] = alumnos
            print(content)

            return Response(content)
        else:
            return Response("")
