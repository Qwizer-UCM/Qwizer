from drf_spectacular.utils import OpenApiExample, OpenApiParameter, OpenApiResponse, extend_schema, extend_schema_view
from api.models import Asignatura, Cuestionario, Cursa, Imparte, Intento, OpcionTest, Pregunta, User, PreguntaTest, PreguntaText
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


@extend_schema_view(
    list=extend_schema(
        summary="Lista de asignaturas",
        responses={
            200: OpenApiResponse(
                response={
                    "type": "object",
                    "properties": {"asignaturas": {"type": "array", "items": {"type": "object", "properties": {"id": {"type": "string"}, "asignatura": {"type": "string"}}}}},
                },
            ),
        },
    ),
    cuestionarios=extend_schema(
        summary="Lista de cuestionarios de una asignatura",
        parameters=[
            OpenApiParameter(name="id", type=int, location=OpenApiParameter.PATH, description="Id de la asignatura"),
        ],
        responses={
            200: OpenApiResponse(
                response={
                    "type": "object",
                    "properties": {
                        "cuestionarios": {"type": "array", "items": {"type": "object", "properties": {"id": {"type": "string"}, "titulo": {"type": "string"}}}},
                        "nombre": {"type": "string"},
                    },
                }
            )
        },
    ),
    preguntas=extend_schema(
        summary="Lista de preguntas de una asignatura",
        parameters=[
            OpenApiParameter(name="id", type=int, location=OpenApiParameter.PATH, description="Id de la asignatura"),
        ],
        responses={
            200: OpenApiResponse(
                response={
                    "type": "object",
                    "properties": {
                        "preguntas": {
                            "type": "array",
                            "items": {
                                "oneOf": [
                                    {
                                        "type": "object",
                                        "properties": {
                                            "id": {"type": "integer"},
                                            "question": {"type": "string"},
                                            "title": {"type": "string"},
                                            "type": {"type": "string", "enum": ["text"]},
                                            "correct_op": {"type": "string"},
                                        },
                                    },
                                    {
                                        "type": "object",
                                        "properties": {
                                            "id": {"type": "integer"},
                                            "question": {"type": "string"},
                                            "title": {"type": "string"},
                                            "type": {"type": "string", "enum": ["test"]},
                                            "options": {"type": "array", "items": {"type": "object", "properties": {"id": {"type": "string"}, "op": {"type": "integer"}}}},
                                            "correct_op": {"type": "integer"},
                                        },
                                    },
                                ]
                            },
                        },
                    },
                }
            )
        },
    ),
    me=extend_schema(
        summary="Estado de los cuestionarios de un usuario",
        responses={
            200: OpenApiResponse(
                response={
                    "type": "object",
                    "properties": {
                        "asignaturas": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "id": {"type": "integer"},
                                    "nombre": {"type": "string"},
                                    "cuestionarios": {
                                        "type": "object",
                                        "properties": {"nCuestionarios": {"type": "integer"}, "nCorregidos": {"type": "integer"}, "nPendientes": {"type": "integer"}},
                                    },
                                },
                            },
                        }
                    },
                }
            )
        },
    ),
    enroll=extend_schema(
        summary="Matricular una lista de estudiantes",
        parameters=[
            OpenApiParameter(name="id", type=int, location=OpenApiParameter.PATH, description="Id de la asignatura"),
        ],
        request={
            200: {
                # TODO no funciona con array
                "type": "object",
                "properties": {"alumnos": {"type": "object", "properties": {"id": {"type": "integer"}, "nombre": {"type": "string"}, "apellidos": {"type": "string"}}}},
            }
        },
        responses={
            200: OpenApiResponse(
                response={
                    "type": "object",
                    "properties": {
                        "insertados": {"type": "integer"},
                        "errors": {
                            "type": "array",
                            "items": {
                                "alumnos": {
                                    "type": "string",
                                }
                            },
                        },
                    },
                }
            )
        },
    ),
    delete_enroll=extend_schema(
        summary="Desmatricular una lista de estudiantes",
        parameters=[
            OpenApiParameter(name="id", type=int, location=OpenApiParameter.PATH, description="Id de la asignatura"),
        ],
        request={
            200: {
                # TODO no funciona con array
                "type": "object",
                "properties": {"alumnos": {"type": "object", "properties": {"id": {"type": "integer"}, "nombre": {"type": "string"}, "apellidos": {"type": "string"}}}},
            }
        },
        responses={
            200: OpenApiResponse(
                response={
                    "type": "object",
                    "properties": {
                        "borrados": {"type": "integer"},
                        "errors": {
                            "type": "array",
                            "items": {
                                "alumnos": {
                                    "type": "string",
                                }
                            },
                        },
                    },
                }
            )
        },
    ),
)
class SubjectViewSet(viewsets.ViewSet):
    permission_classes = []

    def list(self, request):
        lista_asignaturas = []
        # comprobar que es un profesor
        # if request.user.rol == "teacher":
        asignaturas = Asignatura.objects.all()  # TODO comprobrar mejora de esto
        for asignatura in asignaturas:
            lista_asignaturas.append({"id": asignatura.id, "asignatura": asignatura.nombreAsignatura})

        return Response({"asignaturas": lista_asignaturas})

    @action(methods=["GET"], detail=True)
    def cuestionarios(self, request, pk):
        lista_cuestionarios = []
        asignatura = Asignatura.objects.get_by_id(id_asignatura=pk)

        cuestionarios = Cuestionario.objects.get_by_asignatura(id_asignatura=pk).order_by_fecha_cierre_desc()
        for cuestionario in cuestionarios:
            lista_cuestionarios.append({"id": cuestionario.id, "titulo": cuestionario.titulo})
        return Response({"cuestionarios": lista_cuestionarios, "nombre": asignatura.nombreAsignatura})

    @action(methods=["GET"], detail=True)
    def preguntas(self, request, pk):
        """
        Devuelve todas las preguntas de una asignatura para el banco de preguntas
        """
        if str(request.user.role) == User.STUDENT:
            content = {
                "inserted": "false",
                "message": "Error:  debes de ser administrador o profesor.",
            }
            return Response(content)

        lista_preguntas = Pregunta.objects.get_by_asignatura(id_asignatura=pk)
        preguntas = []
        for pregunta in lista_preguntas:
            pregunta_json = {}
            pregunta_json["id"] = pregunta.id
            pregunta_json["question"] = pregunta.pregunta
            pregunta_json["title"] = pregunta.titulo
            if hasattr(pregunta, "preguntatest"):
                pregunta_json["type"] = "test"
                opciones_lista = []
                opciones = OpcionTest.objects.get_by_pregunta(id_pregunta=pregunta.id)
                for opcion in opciones:
                    opciones_json = {}
                    opciones_json["id"] = opcion.id
                    opciones_json["op"] = opcion.opcion
                    opciones_lista.append(opciones_json)
                pregunta_json["options"] = opciones_lista

                pregunta_json["correct_op"] = PreguntaTest.objects.get_by_id(id_pregunta=pregunta.id).respuesta.id
            if hasattr(pregunta, "preguntatext"):
                pregunta_json["type"] = "text"
                pregunta_json["correct_op"] = PreguntaText.objects.get_by_id(id_pregunta=pregunta.id).respuesta
            preguntas.append(pregunta_json)

        message_json = {}
        message_json["preguntas"] = preguntas

        return Response(message_json)

    @action(methods=["GET"], detail=False)
    def me(self, request):
        lista_asignaturas = []
        lista_id_asignaturas = []
        identif = request.user.id
        role = str(request.user.role)
        print(role)

        if role != User.STUDENT and role != User.TEACHER:
            return Response("El admin no tiene ninguna asignatura")

        if role == User.STUDENT:
            lista_id_asignaturas = Cursa.objects.get_by_alumno(id_alumno=identif).order_by("asignatura")
        elif role == User.TEACHER:
            lista_id_asignaturas = Imparte.objects.get_by_profesor(id_profesor=identif).order_by_id_asignatura()

        for asignatura in lista_id_asignaturas:
            asignatura_json = {"id": asignatura.asignatura.id, "nombre": asignatura.asignatura.nombreAsignatura}

            cuestionarios = Cuestionario.objects.get_by_asignatura(id_asignatura=asignatura.asignatura.id)
            n_cuestionarios = cuestionarios.count()
            n_corregidos = Intento.objects.count_corregidos(cuestionarios=cuestionarios, id_alumno=identif)
            n_pendientes = n_cuestionarios - n_corregidos
            asignatura_json["cuestionarios"] = {
                "nCuestionarios": n_cuestionarios,
                "nCorregidos": n_corregidos,
                "nPendientes": n_pendientes,
            }

            lista_asignaturas.append(asignatura_json)

        print(lista_asignaturas)
        return Response({"asignaturas": lista_asignaturas})

    @action(methods=["POST"], detail=True)
    def enroll(self, request, pk):
        """
        POST /asignatura/{pk}/enroll
        """
        if str(request.user.role) != User.STUDENT:
            content = {}
            correct = True
            alumnos_fallidos = []
            alumnos = request.data["alumnos"]

            for alumno in alumnos:
                objeto_es_alumno = Cursa.objects.create_es_alumno(idAlumno=alumno["id"], idAsignatura=pk)
                try:
                    objeto_es_alumno.save()
                except:
                    correct = False
                    alumnos_fallidos.append(alumno["nombre"] + " " + alumno["apellidos"])

            content["insertados"] = correct
            content["errors"] = alumnos_fallidos
            return Response(content)
        else:
            return Response("")

    @action(methods=["POST"], detail=True)
    def delete_enroll(self, request, pk):
        """
        DELETE /asignatura/{pk}/enroll
        """
        print(request.data)
        if str(request.user.role) != User.STUDENT:
            correct = True
            alumnos_fallidos = []
            alumnos = request.data["alumnos"]
            for alumno in alumnos:
                objeto_es_alumno = Cursa.objects.get_by_alumno_asignatura(id_alumno=alumno["id"], id_asignatura=pk)
                try:
                    objeto_es_alumno.delete()
                except:
                    correct = False
                    alumnos_fallidos.append(alumno["nombre"] + " " + alumno["apellidos"])

            content = {"borrados": correct, "errors": alumnos_fallidos}
            return Response(content)
        else:
            return Response("")
