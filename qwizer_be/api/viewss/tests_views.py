from datetime import datetime
import json

from django.db import IntegrityError
from django.db.models import Q
import yaml

from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from ..serializer import EncryptedTestsSerializer
from ..models import (
    Asignaturas,
    Cuestionarios,
    Notas,
    OpcionesTest,
    PerteneceACuestionario,
    Preguntas,
    RespuestasEnviadas,
    RespuestasEnviadasTest,
    RespuestasEnviadasText,
    RespuestasTest,
    RespuestasTexto,
    User,
)

# Create your views here.

# TODO No se han indicado permisos todavia
class TestsViewSet(
    mixins.CreateModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet
):
    queryset = Cuestionarios.objects.all()
    serializer_class = EncryptedTestsSerializer
    permission_classes = []

    @action(detail=True, methods=["POST"])
    def response(self, request, pk):  # pylint: disable=method-hidden,invalid-name
        """
        POST /response -> POST /tests/1/response
        """
        print(pk)
        # TODO idCuestionario no haria falta ya que esta en pk
        # TODO se manda desde localstorage por alguna razon :/
        # json.loads(request.data["respuestas"])
        req_respuestas = request.data["respuestas"]

        # TODO falta el save y sustituye a todo lo de abajo
        # test = RespuestasSerializer(data=request.data["respuestas"]["respuestas"],context={'user': request.user, 'idCuestionario': request.data["respuestas"]["idCuestionario"]},many=True)
        # print(test.is_valid())
        # print(test.errors)
        # print(test.data)

        respuestas = req_respuestas["respuestas"]
        for respuesta in respuestas:
            if respuesta["type"] == "test":
                respuesta_enviada = RespuestasEnviadasTest(
                    idCuestionario_id=req_respuestas["idCuestionario"],
                    idAlumno=request.user,
                    idPregunta_id=respuesta["id"],
                    idRespuesta_id=respuesta["answr"],
                )
                respuesta_enviada.save()
            if respuesta["type"] == "text":
                respuesta_enviada = RespuestasEnviadasText(
                    idCuestionario_id=req_respuestas["idCuestionario"],
                    idAlumno=request.user,
                    idPregunta_id=respuesta["id"],  # TODO catch integrity exception
                    Respuesta=respuesta["answr"],
                )
                respuesta_enviada.save()

        nota = 0
        for respuesta in respuestas:
            nota = nota + RespuestasEnviadas.calcular_nota(
                respuesta, req_respuestas["idCuestionario"]
            )

        nota_alumno = Notas(
            idAlumno=request.user,
            idCuestionario_id=req_respuestas["idCuestionario"],
            nota=nota,
            hash=hash,
        )
        nota_alumno.save()
        content = {
            "nota": nota,
            "preguntasAcertadas": "NULL",  # TODO Por que?
            "preguntasFalladas": "NULL",
        }

        return Response(content)

    @action(detail=True, methods=["GET"])
    def corrected(self, request, pk):
        """
        POST /test-corrected -> GET /tests/{pk}/corrected
        """
        if request.user.role == "student":
            alumno = request.user
        else:
            alumno = User.objects.get(id=request.data["idAlumno"])

        cuestionario = Cuestionarios.objects.get(id=request.data["idCuestionario"])
        pertenecen = PerteneceACuestionario.objects.filter(
            idCuestionario=cuestionario.id
        )
        nota_obj = Notas.objects.get(idCuestionario=cuestionario, idAlumno=alumno)

        questions = []
        for pertenece in pertenecen:
            pregunta = pertenece.idPregunta
            pregunta_json = {}
            pregunta_json["id"] = pregunta.id
            pregunta_json["question"] = pregunta.pregunta
            pregunta_json["type"] = pregunta.tipoPregunta
            if pregunta.tipoPregunta == "test":
                opciones_lista = []
                opciones = OpcionesTest.objects.filter(idPregunta=pregunta.id)
                for opcion in opciones:
                    opciones_json = {}
                    opciones_json["id"] = opcion.id
                    opciones_json["op"] = opcion.opcion
                    opciones_lista.append(opciones_json)
                pregunta_json["options"] = opciones_lista
                pregunta_json["correct_op"] = RespuestasTest.objects.get(
                    idPregunta=pregunta
                ).idOpcion.id
                pregunta_json["user_op"] = RespuestasEnviadasTest.objects.get(
                    idCuestionario=cuestionario, idAlumno=alumno, idPregunta=pregunta
                ).idRespuesta.id
            if pregunta.tipoPregunta == "text":
                pregunta_json["correct_op"] = RespuestasTexto.objects.get(
                    idPregunta=pregunta
                ).respuesta
                pregunta_json["user_op"] = RespuestasEnviadasText.objects.get(
                    idCuestionario=cuestionario, idAlumno=alumno, idPregunta=pregunta
                ).Respuesta
            questions.append(pregunta_json)

        message_json = {}
        message_json["titulo"] = cuestionario.titulo
        message_json["nota"] = int(nota_obj.nota)
        # nota en decimal no se serializa bien en json
        # TODO no suena bien este comentario T_T
        message_json["questions"] = questions

        return Response({"corrected_test": json.dumps(message_json)})

    def create(self, request, *args, **kwargs):
        """
        GET /create-quiz -> POST /tests/
        """
        if str(request.user.role) == "student":
            content = {
                "inserted": "false",
                "message": "Error: Para poder crear tests debes de ser administrador o profesor.",
            }
            return Response(content)

        try:
            asignatura = Asignaturas.objects.get(id=request.data["testSubject"])
        except Asignaturas.DoesNotExist:
            content = {
                "inserted": "false",
                "message": "Error: La asignatura no existe!",
            }
            return Response(content)

        cuestionario = Cuestionarios(
            titulo=request.data["testName"],
            secuencial=request.data["secuencial"],
            idAsignatura=asignatura,
            idProfesor=request.user,
            duracion=request.data["testDuration"],
            password=request.data["testPass"],
            fecha_cierre=datetime.fromtimestamp(request.data["fechaCierre"] / 1000),
            fecha_apertura=datetime.fromtimestamp(request.data["fechaApertura"] / 1000),
        )

        try:
            cuestionario.save()
            for i, preguntas in enumerate(request.data["questionList"]):
                pregunta = Preguntas(id=preguntas["id"])

                pertenece = PerteneceACuestionario(
                    nQuestion=i,
                    puntosAcierto=preguntas["punt_positiva"],
                    puntosFallo=preguntas["punt_negativa"],
                    idCuestionario=cuestionario,
                    idPregunta=pregunta,
                )
                pertenece.save()
        except IntegrityError:
            return Response(
                {"inserted": "false", "message": "Error: El cuestionario ya existe"}
            )

        return Response(
            {
                "inserted": "true",
                "message": "El cuestionario se ha insertado correctamente",
            }
        )

    @action(detail=True, methods=["GET"])
    def grades(self, request, pk):
        """
        POST /get-quiz-grades -> GET /tests/{pk}/grades
        """
        # TODO de ellos -> comporbar que es alumno

        cuestionario = Cuestionarios.objects.get(id=pk)

        alumnos = User.objects.filter(
            Q(notas__idCuestionario=pk) | Q(notas__idCuestionario__isnull=True),
            esalumno__idAsignatura_id=cuestionario.idAsignatura.id,
        ).values("id", "first_name", "last_name", "notas__nota")

        notas = []
        for alumno in alumnos:
            print(alumno)
            alumno_json = {}
            alumno_json["id"] = alumno["id"]
            alumno_json["nombre"] = alumno["first_name"]
            alumno_json["apellidos"] = alumno["last_name"]
            alumno_json["nota"] = (
                "No presentado"
                if alumno["notas__nota"] is None
                else alumno["notas__nota"]
            )
            notas.append(alumno_json)

        return Response(
            {
                "notas": notas,
            }
        )

    @action(detail=True, methods=["GET"])
    def info(self, request, pk):
        """
        POST /get-quiz-info -> GET /tests/{pk}/info
        """
        cuestionario = Cuestionarios.objects.get(id=pk)
        duracion = cuestionario.duracion
        fecha_apertura = cuestionario.fecha_apertura
        fecha_cierre = cuestionario.fecha_cierre
        nota_cuestionario = 0
        try:
            # TODO no creo que este arreglado y no entiendo bien a que se refiere
            # -----
            # Corregir Un alumno solo puede tener una nota para un cuestionario, solo puede hacer un cuestionrio una vez
            # ......
            nota = Notas.objects.get(
                idCuestionario=cuestionario, idAlumno=request.user
            )  # <-- Salta excepcion si devuelve mas de uno
            corregido = 1
            nota_cuestionario = nota.nota
        except IntegrityError:
            corregido = 0
        print(fecha_cierre.strftime("%d/%m/%Y, %H:%M:%S"), fecha_cierre)
        return Response(
            {
                "duracion": duracion,
                "formattedFechaApertura": fecha_apertura.strftime("%d/%m/%Y, %H:%M:%S"),
                "formattedFechaCierre": fecha_cierre.strftime("%d/%m/%Y, %H:%M:%S"),
                "FechaApertura": fecha_apertura,
                "FechaCierre": fecha_cierre,
                "corregido": corregido,
                "nota": nota_cuestionario,
            }
        )

    @action(detail=False, methods=["POST"])
    def upload(self, request):
        """
        POST /upload -> POST /tests/upload
        """
        if str(request.user.role) == "student":
            content = {
                "inserted": "false",
                "message": "Error: Para poder crear tests debes de ser administrador o profesor.",
            }
            return Response(content)

        try:
            yamlplscomeon = yaml.load(
                request.data["fichero_yaml"], Loader=yaml.FullLoader
            )
        except yaml.YAMLError:
            content = {
                "inserted": "false",
                "message": "Error: El cuestionario está mal formado. Por favor, revisa que lo hayas escrito bien.",
            }
            return Response(content)
        # 1. Generamos el test
        fecha_apertura = yamlplscomeon["cuestionario"]["fecha_apertura"]
        passw = yamlplscomeon["cuestionario"]["password"]
        date_time_apertura = datetime.strptime(fecha_apertura, "%y/%m/%d %H:%M:%S")
        fecha_cierre = yamlplscomeon["cuestionario"]["fecha_cierre"]
        date_time_cierre = datetime.strptime(fecha_cierre, "%y/%m/%d %H:%M:%S")
        title = yamlplscomeon["cuestionario"]["titulo"]
        nombre_asig = yamlplscomeon["cuestionario"]["asignatura"]
        profesor = request.user
        sec = yamlplscomeon["cuestionario"]["secuencial"]
        durat = yamlplscomeon["cuestionario"]["duracion"]
        try:
            asignatura = Asignaturas.objects.get(asignatura=nombre_asig)
        except:
            content = {
                "inserted": "false",
                "message": "Error: La asignatura no existe!",
            }
            return Response(content)

        cuestionario = Cuestionarios(
            titulo=title,
            secuencial=sec,
            idAsignatura=asignatura,
            idProfesor=profesor,
            duracion=durat,
            password=passw,
            fecha_cierre=date_time_cierre,
            fecha_apertura=date_time_apertura,
        )
        try:
            cuestionario.save()
        except:
            content = {
                "inserted": "false",
                "message": "Error: El cuestionario ya existe",
            }
            return Response(content)

        preguntas = yamlplscomeon["cuestionario"]["preguntas"]
        i = 0

        for q in preguntas:
            print(q["tipo"])

            try:
                pregunta = Preguntas(
                    tipoPregunta=q["tipo"],
                    pregunta=q["pregunta"],
                    idAsignatura=asignatura,
                    titulo=q["titulo"],
                )
                pregunta.save()
            except:
                pregunta = Preguntas.objects.get(
                    tipoPregunta=q["tipo"],
                    pregunta=q["pregunta"],
                    idAsignatura=asignatura,
                    titulo=q["titulo"],
                )
                pertenece = PerteneceACuestionario(
                    nQuestion=i,
                    puntosAcierto=q["punt_positiva"],
                    puntosFallo=q["punt_negativa"],
                    idCuestionario=cuestionario,
                    idPregunta=pregunta,
                )
                pertenece.save()
                continue

            pertenece = PerteneceACuestionario(
                nQuestion=i,
                puntosAcierto=q["punt_positiva"],
                puntosFallo=q["punt_negativa"],
                idCuestionario=cuestionario,
                idPregunta=pregunta,
            )
            pertenece.save()

            pregunta = Preguntas.objects.get(
                tipoPregunta=q["tipo"],
                pregunta=q["pregunta"],
                idAsignatura=asignatura,
                titulo=q["titulo"],
            )
            # Guardamos las opciones
            if q["tipo"] == "test":
                j = 0
                opciones = q["opciones"]
                for o in opciones:
                    opcion = OpcionesTest(opcion=o, idPregunta=pregunta)
                    try:
                        opcion.save()
                        if j == q["op_correcta"]:
                            respuesta = RespuestasTest(
                                idOpcion=opcion, idPregunta=pregunta
                            )
                            respuesta.save()
                        j += 1
                    except:
                        print("La pregunta ya existia")
            elif q["tipo"] == "text":
                respuestaText = RespuestasTexto(
                    respuesta=q["opciones"], idPregunta=pregunta
                )
                respuestaText.save()
            i += 1

        content = {
            "inserted": "true",
            "message": "El cuestionario se ha insertado correctamente",
        }
        return Response(content)
