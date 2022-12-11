from api.models import (
    Asignaturas,
    Cuestionarios,
    EsAlumno,
    Imparte,
    Notas,
    OpcionesTest,
    Preguntas,
    RespuestasTest,
    RespuestasTexto,
    User,
)
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


class SubjectViewSet(viewsets.ViewSet):
    permission_classes = []

    def list(self, request):
        lista_asignaturas = []
        # comprobar que es un profesor
        # if request.user.rol == "teacher":
        asignaturas = Asignaturas.objects.all()  # TODO comprobrar mejora de esto
        for asignatura in asignaturas:
            lista_asignaturas.append({"id": asignatura.id, "asignatura": asignatura.asignatura})

        return Response({"asignaturas": lista_asignaturas})

    @action(methods=["GET"], detail=True)
    def cuestionarios(self, request, pk):
        lista_cuestionarios = []
        asignatura = Asignaturas.objects.get_by_id(id_asignatura=pk)

        cuestionarios = Cuestionarios.objects.get_by_asignatura(id_asignatura=pk).order_by_fecha_cierre_desc()
        id_cuestionarios = []
        for cuestionario in cuestionarios:
            lista_cuestionarios.append(cuestionario.titulo)
            id_cuestionarios.append(cuestionario.id)
        return Response({"cuestionarios": lista_cuestionarios, "idCuestionarios": id_cuestionarios, "nombre": asignatura.asignatura})

    @action(methods=["GET"], detail=True)
    def preguntas(self, request, pk):
        """
        Devuelve todas las preguntas de una asignatura para el banco de preguntas
        """
        if str(request.user.role) == "student":
            content = {
                "inserted": "false",
                "message": "Error:  debes de ser administrador o profesor.",
            }
            return Response(content)

        asignatura = Asignaturas.objects.get_by_id(id_asignatura=pk)
        lista_preguntas = Preguntas.objects.get_by_asignatura(id_asignatura=pk)
        preguntas = []
        print(lista_preguntas)
        for pregunta in lista_preguntas:
            pregunta_json = {}
            pregunta_json["id"] = pregunta.id
            pregunta_json["question"] = pregunta.pregunta
            pregunta_json["title"] = pregunta.titulo
            pregunta_json["type"] = pregunta.tipoPregunta
            if pregunta.tipoPregunta == "test":
                opciones_lista = []
                opciones = OpcionesTest.objects.get_by_pregunta(id_pregunta=pregunta.id)
                for opcion in opciones:
                    opciones_json = {}
                    opciones_json["id"] = opcion.id
                    opciones_json["op"] = opcion.opcion
                    opciones_lista.append(opciones_json)
                pregunta_json["options"] = opciones_lista

                pregunta_json["correct_op"] = RespuestasTest.objects.get_by_pregunta(id_pregunta=pregunta.id).idOpcion.id
            if pregunta.tipoPregunta == "text":
                pregunta_json["correct_op"] = RespuestasTexto.objects.get_by_pregunta(id_pregunta=pregunta.id).respuesta
            preguntas.append(pregunta_json)

        message_json = {}
        message_json["preguntas"] = preguntas
        print(message_json)

        return Response(message_json)

    @action(methods=["GET"], detail=False)
    def me(self, request):
        lista_asignaturas = []
        identif = request.user.id
        role = str(request.user.role)
        print(role)

        if role == "student" or role == "teacher":
            if role == "student":
                lista_id_asignaturas = EsAlumno.objects.get_by_alumno(id_alumno=identif).order_by("idAsignatura")
            elif role == "teacher":
                lista_id_asignaturas = Imparte.objects.get_by_profesor(id_profesor=identif).order_by_id_asignatura()

            for asignatura in lista_id_asignaturas:
                asignatura_json = {"id": asignatura.idAsignatura.id, "nombre": asignatura.idAsignatura.asignatura}

                cuestionarios = Cuestionarios.objects.get_by_asignatura(id_asignatura=asignatura.idAsignatura.id)
                n_cuestionarios = cuestionarios.count()
                n_corregidos = Notas.objects.count_corregidos(cuestionarios=cuestionarios, id_alumno=identif)
                n_pendientes = n_cuestionarios - n_corregidos
                asignatura_json["cuestionarios"] = {
                    "nCuestionarios": n_cuestionarios,
                    "nCorregidos": n_corregidos,
                    "nPendientes": n_pendientes,
                }

                lista_asignaturas.append(asignatura_json)

        else:
            return Response("El admin no tiene ninguna asignatura")

        print(lista_asignaturas)
        return Response({"asignaturas": lista_asignaturas})

    @action(methods=["POST"], detail=True)
    def enroll(self, request, pk):
        """
        POST /asignatura/{pk}/enroll
        """
        if str(request.user.role) != "student":
            content = {}
            correct = True
            alumnos_fallidos = []
            alumnos = request.data["alumnos"]
            asignatura = pk
            print(alumnos)
            print(asignatura)
            for alumno in alumnos:
                print(alumno["id"])
                objeto_alumno = User.objects.get_by_id(id_usuario=alumno["id"])
                print(objeto_alumno)
                objeto_asignatura = Asignaturas.objects.get_by_id(id_asignatura=asignatura)
                objeto_es_alumno = EsAlumno.objects.create_es_alumno(idAlumno=objeto_alumno, idAsignatura=objeto_asignatura)

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
        if str(request.user.role) != "student":
            correct = True
            alumnosFallidos = []
            alumnos = request.data["alumnos"]
            for alumno in alumnos:
                objetoEsAlumno = EsAlumno.objects.filter(idAlumno=alumno["id"], idAsignatura=pk)

                try:
                    objetoEsAlumno.delete()
                except:
                    correct = False
                    alumnosFallidos.append(alumno["nombre"] + " " + alumno["apellidos"])

            content = {"borrados": correct, "errors": alumnosFallidos}
            return Response(content)
        else:
            return Response("")
