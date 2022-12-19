import binascii
import hashlib
import json
from datetime import datetime

import yaml
from api.models import (
    Asignatura,
    Cuestionario,
    Intento,
    OpcionTest,
    PreguntaCuestionario,
    Pregunta,
    RespuestaEnviadaTest,
    RespuestaEnviadaText,
    RespuestasTest,
    RespuestasTexto,
    User,
)
from api.utils.cifrado import _pad_string
from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes
from django.db import IntegrityError
from django.db.models import Q
from rest_framework import mixins, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ..models import (
    Asignatura,
    Cuestionario,
    Intento,
    OpcionTest,
    PreguntaCuestionario,
    Pregunta,
    RespuestaEnviada,
    RespuestaEnviadaTest,
    RespuestaEnviadaText,
    RespuestasTest,
    RespuestasTexto,
    User,
)
from ..serializer import EncryptedTestsSerializer

# TODO No se han indicado permisos todavia
class TestsViewSet(mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    queryset = Cuestionario.objects.all()
    serializer_class = EncryptedTestsSerializer
    permission_classes = []

    def create(self, request):
        if str(request.user.role) == "student":
            content = {
                "inserted": "false",
                "message": "Error: Para poder crear tests debes de ser administrador o profesor.",
            }
            return Response(content)

        profesor = request.user

        cuestionario_data = request.data["cuestionario"]  # TODO habra manera que axios respete los objetos?

        title = cuestionario_data["testName"]
        passw = cuestionario_data["testPass"]
        id_asignatura = cuestionario_data["testSubject"]
        sec = cuestionario_data["secuencial"]
        durat = cuestionario_data["testDuration"]

        fecha_apertura = cuestionario_data["fechaApertura"]
        date_time_apertura = datetime.fromtimestamp(fecha_apertura / 1000)

        fecha_cierre = cuestionario_data["fechaCierre"]
        date_time_cierre = datetime.fromtimestamp(fecha_cierre / 1000)

        lista_preguntas = cuestionario_data["questionList"]

        try:
            asignatura = Asignatura.objects.get_by_id(id_asignatura=id_asignatura)
        except:
            content = {"inserted": "false", "message": "Error: La asignatura no existe!"}
            return Response(content)

        cuestionario = Cuestionario.objects.create_cuestionarios(
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
            content = {"inserted": "false", "message": "Error: El cuestionario ya existe"}
            return Response(content)

        i = 0
        for preguntas in lista_preguntas:
   
            pertenece = PreguntaCuestionario.objects.create_pertenece_a_cuestionario(
                nQuestion=i,
                puntosAcierto=preguntas["punt_positiva"],
                puntosFallo=preguntas["punt_negativa"],
                idCuestionario=cuestionario,
                idPregunta=Pregunta.objects.get_by_id(id_pregunta=preguntas["id"]),
            )
            pertenece.save()

            i += 1

        content = {
            "inserted": "true",
            "message": "El cuestionario se ha insertado correctamente",
        }

        return Response(content)

    @action(detail=True, methods=["POST"])
    def enviar(self, request, pk):  # pylint: disable=method-hidden,invalid-name
        """
        POST /response -> POST /tests/1/response
        """
        respuestas = request.data["respuestas"]
        id_cuestionario = pk
        cuestionario = Cuestionario.objects.get_by_id(id_cuestionario=id_cuestionario)
        alumno = request.user

        nota = 0
        for key,respuesta in respuestas.items():
            print(respuesta)
            pregunta = Pregunta.objects.get_by_id(id_pregunta=respuesta["id"])

            if respuesta["type"] == "test" and str(respuesta["answr"]).isdigit():
                opcion = OpcionTest.objects.get_by_id(id_opciones=respuesta["answr"])
                respuesta_enviada = RespuestaEnviadaTest.objects.create_respuesta(
                    idCuestionario=cuestionario,
                    idAlumno=alumno,
                    idPregunta=pregunta,
                    idRespuesta=opcion,
                )
                respuesta_enviada.save()
            if respuesta["type"] == "text":
                respuesta_enviada = RespuestaEnviadaText.objects.create_respuesta(
                    idCuestionario=cuestionario,
                    idAlumno=alumno,
                    idPregunta=pregunta,
                    Respuesta=respuesta["answr"],
                )
                respuesta_enviada.save()

            nota = nota + RespuestaEnviada.calcular_nota(respuesta,id_cuestionario)

        nota_alumno = Intento.objects.create_notas(
            idAlumno=request.user,
            idCuestionario=cuestionario,
            nota=nota,
            hash=request.data["hash"],
        )
        nota_alumno.save()
        content = {
            "nota": nota,
            "preguntasAcertadas": "NULL",  # TODO Por que?
            "preguntasFalladas": "NULL",
        }

        return Response(content)

    @action(detail=True, methods=["GET"], url_path=r"nota/(?P<id_alumno>\d+)")
    def nota(self, request, pk, id_alumno):
        """TODO ruta un poco extraña pensar alternativa
        GET /tests/{id_cuestionario}/nota/{id_alumno}
        """
        if (hasattr(request.user, "role") and request.user.role == "student") or id_alumno == "":
            alumno = request.user
        else:
            alumno = User.objects.get_by_id(id_usuario=id_alumno)

        cuestionario = Cuestionario.objects.get_by_id(id_cuestionario=pk)
        pertenecen = PreguntaCuestionario.objects.get_by_cuestionario(id_cuestionario=cuestionario.id)
        nota_obj = Intento.objects.get_by_cuestionario_alumno(id_cuestionario=pk, id_alumno=id_alumno)

        questions = []
        for pertenece in pertenecen:
            pregunta = pertenece.idPregunta
            pregunta_json = {}
            pregunta_json["id"] = pregunta.id
            pregunta_json["question"] = pregunta.pregunta
            pregunta_json["type"] = pregunta.tipoPregunta
            if pregunta.tipoPregunta == "test":
                opciones_lista = []
                opciones = OpcionTest.objects.get_by_pregunta(id_pregunta=pregunta.id)
                for opcion in opciones:
                    opciones_lista.append({"id": opcion.id, "op": opcion.opcion})
                pregunta_json["options"] = opciones_lista
                pregunta_json["correct_op"] = RespuestasTest.objects.get_by_pregunta(id_pregunta=pregunta.id).idOpcion.id
                # TODO esto es un apaño para qe funcione hay que reescribirlo todo
                pregunta_json["user_op"] = RespuestaEnviadaTest.objects.get_by_cuestionario_alumno_pregunta(id_cuestionario=pk,id_alumno=id_alumno,id_pregunta=pregunta.id)
                if pregunta_json["user_op"] is not None:
                    pregunta_json["user_op"] = pregunta_json["user_op"].idRespuesta.id
            if pregunta.tipoPregunta == "text":
                pregunta_json["correct_op"] = RespuestasTexto.objects.get_by_pregunta(id_pregunta=pregunta.id).respuesta
                pregunta_json["user_op"] = RespuestaEnviadaText.objects.get_by_cuestionario_alumno_pregunta(id_cuestionario=pk,id_alumno=id_alumno,id_pregunta=pregunta.id)
                if pregunta_json["user_op"] is not None:
                    pregunta_json["user_op"] = pregunta_json["user_op"].Respuesta
            questions.append(pregunta_json)

        message_json = {}
        message_json["titulo"] = cuestionario.titulo
        message_json["nota"] = nota_obj.nota
        message_json["questions"] = questions

        quiz_string = message_json

        content = {
            "corrected_test": quiz_string,
        }
        print(content)
        return Response(content)

    @action(detail=True, methods=["GET"])
    def notas(self, request, pk):
        """
        POST /get-quiz-grades -> GET /tests/{pk}/grades
        """
        cuestionario = Cuestionario.objects.get_by_id(id_cuestionario=pk)

        alumnos = User.objects.get_users_from_test(id_asignatura=cuestionario.idAsignatura.id,id_cuestionario=pk)
        notas = []
        for alumno in alumnos:
            nota = "No presentado" if alumno["notas__nota"] is None else alumno["notas__nota"]
            notas.append({"id": alumno['id'], "nombre": alumno['first_name'], "apellidos": alumno['last_name'], "nota": nota})
        return Response({"notas": notas})

    @action(detail=True, methods=["GET"])
    def info(self, request, pk):
        """
        POST /get-quiz-info -> GET /tests/{pk}/info
        """
        cuestionario = Cuestionario.objects.get_by_id(id_cuestionario=pk)
        duracion = cuestionario.duracion
        fecha_apertura = cuestionario.fecha_apertura
        fecha_cierre = cuestionario.fecha_cierre
        nota_cuestionario = 0
        try:
            # TODO no creo que este arreglado y no entiendo bien a que se refiere
            # -----
            # Corregir Un alumno solo puede tener una nota para un cuestionario, solo puede hacer un cuestionrio una vez
            # ......
            nota = Intento.objects.get_by_cuestionario_alumno(
                id_cuestionario=pk, id_alumno=request.user.id
            )  # <-- Salta excepcion si devuelve mas de uno
            corregido = 1
            nota_cuestionario = nota.nota
        except:
            corregido = 0
        print(fecha_cierre.strftime("%d/%m/%Y, %H:%M:%S"), fecha_cierre)
        return Response(
            {
                "duracion": duracion,
                "formatted_fecha_apertura": fecha_apertura.strftime("%d/%m/%Y, %H:%M:%S"),
                "formatted_fecha_cierre": fecha_cierre.strftime("%d/%m/%Y, %H:%M:%S"),
                "fecha_apertura": fecha_apertura,
                "fecha_cierre": fecha_cierre,
                "corregido": corregido,
                "nota": nota_cuestionario,
            }
        )

    @action(detail=False, methods=["POST"])
    def subir(self, request):
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
            yamlplscomeon = yaml.load(request.data["fichero_yaml"], Loader=yaml.FullLoader)
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
            asignatura = Asignatura.objects.get_by_asignatura(nombre_asignatura=nombre_asig)
        except:
            content = {
                "inserted": "false",
                "message": f"Error: La asignatura {nombre_asig} no existe!",
            }
            return Response(content)

        cuestionario = Cuestionario.objects.create_cuestionarios(
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
                pregunta = Pregunta.objects.create_preguntas(
                    tipoPregunta=q["tipo"],
                    pregunta=q["pregunta"],
                    idAsignatura=asignatura,
                    titulo=q["titulo"],
                )
                pregunta.save()
            except:
                pregunta = Pregunta.objects.get_by_asignatura_pregunta_tipo_titulo(
                    tipo=q["tipo"],
                    pregunta=q["pregunta"],
                    id_asignatura=asignatura.id,
                    titulo=q["titulo"],
                )
                pertenece = PreguntaCuestionario.objects.create_pertenece_a_cuestionario(
                    nQuestion=i,
                    puntosAcierto=q["punt_positiva"],
                    puntosFallo=q["punt_negativa"],
                    idCuestionario=cuestionario,
                    idPregunta=pregunta,
                )
                pertenece.save()
                continue

            pertenece = PreguntaCuestionario.objects.create_pertenece_a_cuestionario(
                nQuestion=i,
                puntosAcierto=q["punt_positiva"],
                puntosFallo=q["punt_negativa"],
                idCuestionario=cuestionario,
                idPregunta=pregunta,
            )
            pertenece.save()

            pregunta = Pregunta.objects.get_by_asignatura_pregunta_tipo_titulo(
                tipo=q["tipo"],
                pregunta=q["pregunta"],
                id_asignatura=asignatura.id,
                titulo=q["titulo"],
            )
            # Guardamos las opciones
            if q["tipo"] == "test":
                j = 0
                opciones = q["opciones"]
                for o in opciones:
                    opcion = OpcionTest.objects.create_opciones_test(opcion=o, idPregunta=pregunta)
                    try:
                        opcion.save()
                        if j == q["op_correcta"]:
                            respuesta = RespuestasTest.objects.create_respuestas_test(idOpcion=opcion, idPregunta=pregunta)
                            respuesta.save()
                        j += 1
                    except:
                        print("La pregunta ya existia")
            elif q["tipo"] == "text":
                respuestaText = RespuestasTexto.objects.create_respuestas_texto(respuesta=q["opciones"], idPregunta=pregunta)
                respuestaText.save()
            i += 1

        content = {
            "inserted": "true",
            "message": "El cuestionario se ha insertado correctamente",
        }
        return Response(content)
