import random
from datetime import datetime

import yaml
from api.models import (Asignatura, Cuestionario, InstanciaPreguntaTest,
                        InstanciaPreguntaText, Intento, OpcionTest, Pregunta,
                        PreguntaCuestionario, PreguntaTest, PreguntaText, User)
from api.utils.cifrado import decrypt, encrypt_tests
from django.utils.timezone import make_aware
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from ..models import (Asignatura, Cuestionario, InstanciaOpcionTest,
                      InstanciaPregunta, InstanciaPreguntaTest,
                      InstanciaPreguntaText, Intento, OpcionTest, Pregunta,
                      PreguntaCuestionario, User)
from ..serializer import (EncryptedTestsSerializer, InstanciaOpcionSerializer,
                          InstanciaPreguntaSerializer,
                          PreguntaCuestionarioSerializer, PreguntasSerializer)


def shuffle(res):
    """
    Usado para aleatorizar cuestionarios.
    Devuelve tuplas de la forma:
        - indice aleatorio al que se le ha asignado al elemento
        - elemento
    """
    indices_libres, elementos_libres = zip(*[(i, e) for i, e in enumerate(res) if not e["fijar"]])
    return zip(random.sample(indices_libres, len(indices_libres)), elementos_libres)


TIME_FORMAT = "%d/%m/%Y, %H:%M:%S"  # TODO fichero de constantes?
# TODO No se han indicado permisos todavia
class TestsViewSet(mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    queryset = Cuestionario.objects.all()
    serializer_class = EncryptedTestsSerializer
    permission_classes = []

    def retrieve(self, request, pk):
        try:
            intento = Intento.objects.get_by_cuestionario_alumno(id_cuestionario=pk, id_alumno=request.user.id)  # TODO se puede crear metodo para exists
            exists = True
        except:
            exists = False

        try:
            cuestionario = Cuestionario.objects.get_by_id(id_cuestionario=pk)
        except:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        # Serializar las preguntas
        res = PreguntasSerializer(cuestionario.preguntas.all(), many=True).data
        for preg in res:
            pertenece = PreguntaCuestionarioSerializer(PreguntaCuestionario.objects.get_by_pregunta_cuestionario(id_pregunta=preg["id"], id_cuestionario=cuestionario.id)).data
            preg["fijar"], preg["orden"] = pertenece["fijar"], pertenece["orden"]

        if exists:
            # Recuperar orden de las preguntas
            res_copy = res.copy()
            for i, preg in enumerate(res_copy):
                override = InstanciaPreguntaSerializer(InstanciaPregunta.objects.get_by_intento_pregunta(id_intento=intento.id, id_pregunta=preg["id"])).data
                preg["orden"] = override["orden"]
                res[preg["orden"]] = preg
                if preg["tipoPregunta"] == "test":
                    for opc in preg["opciones_test"]:
                        opc_override = InstanciaOpcionSerializer(InstanciaOpcionTest.objects.get_by_instpregunta_opcion(id_instpregunta=override["id"], id_opcion=opc["id"])).data
                        opc["orden"] = opc_override["orden"]
                        res[preg["orden"]]["opciones_test"][opc["orden"]] = opc
        else:
            if cuestionario.aleatorizar:
                # Aleatorizar las preguntas
                for i, elem in shuffle(res):
                    res[i] = elem
                    res[i]["orden"] = i
                    if elem["tipoPregunta"] == "test":
                        for j, opc in shuffle(res[i]["opciones_test"]):
                            res[i] = elem
                            res[i]["orden"] = i
            else:
                res = sorted(res, key=lambda d: d["orden"]) #TODO ordenar en back o front?
            # Guardar el orden aleatorio para el alumno
            intento = Intento.objects.create_intento(idAlumno=request.user.id, idCuestionario=cuestionario.id, commit=True)
            for i, preg in enumerate(res):
                if preg["tipoPregunta"] == "test":
                    inst = InstanciaPreguntaTest.objects.create_instancia(id_intento=intento.id, id_pregunta=preg["id"], id_respuesta=None, orden=preg["orden"], commit=True)
                    for j, opc in enumerate(preg["opciones_test"]):
                        InstanciaOpcionTest.objects.create_instancia(id_instancia=inst.id, id_opcion=opc["id"], orden=opc["orden"], commit=True)
                if preg["tipoPregunta"] == "text":
                    InstanciaPreguntaText.objects.create_instancia(id_intento=intento.id, id_pregunta=preg["id"], respuesta=None, orden=preg["orden"], commit=True)

        # Encriptar tests
        quiz_encrypt = {}
        encrypted = encrypt_tests(res, cuestionario.password)
        quiz_encrypt["iv"] = encrypted["iv"]
        quiz_encrypt["password"] = encrypted["password"]
        quiz_encrypt["encrypted_message"] = encrypted["encrypted_message"]
        # TODO si solo se usa en front la fecha formateada se puede evitar pasar las dos
        quiz_encrypt["formatted_fecha_apertura"] = cuestionario.fecha_apertura.strftime(TIME_FORMAT)
        quiz_encrypt["formatted_fecha_cierre"] = cuestionario.fecha_cierre.strftime(TIME_FORMAT)

        return Response(quiz_encrypt)

    def create(self, request):
        if str(request.user.role) == User.STUDENT:
            content = {
                "inserted": "false",
                "message": "Error: Para poder crear tests debes de ser administrador o profesor.",
            }
            return Response(content)

        profesor = request.user

        cuestionario_data = request.data["cuestionario"]
        title = cuestionario_data["testName"]
        passw = cuestionario_data["testPass"]
        id_asignatura = cuestionario_data["testSubject"]
        sec = cuestionario_data["secuencial"]
        durat = cuestionario_data["testDuration"]

        fecha_apertura = cuestionario_data["fechaApertura"]
        date_time_apertura = make_aware(datetime.fromtimestamp(fecha_apertura / 1000))

        fecha_cierre = cuestionario_data["fechaCierre"]
        date_time_cierre = make_aware(datetime.fromtimestamp(fecha_cierre / 1000))

        fecha_visible = cuestionario_data["fechaVisible"]
        date_time_visible = make_aware(datetime.fromtimestamp(fecha_visible / 1000))

        lista_preguntas = cuestionario_data["questionList"]
        aleatorizar = cuestionario_data["aleatorizar"] if ("aleatorizar" in cuestionario_data) else False

        try:
            asignatura = Asignatura.objects.get_by_id(id_asignatura=id_asignatura)
        except:
            content = {"inserted": "false", "message": "Error: La asignatura no existe!"}
            return Response(content)

        try:
            cuestionario = Cuestionario.objects.create_cuestionarios(
                titulo=title,
                secuencial=sec,
                idAsignatura=asignatura.id,
                idProfesor=profesor.id,
                duracion=durat,
                password=passw,
                fecha_cierre=date_time_cierre,
                fecha_apertura=date_time_apertura,
                fecha_visible=date_time_visible,
                aleatorizar=aleatorizar,
            )
            cuestionario.save()
        except:
            content = {"inserted": "false", "message": "Error: El cuestionario ya existe"}
            return Response(content)

        for i, pregunta in enumerate(lista_preguntas):
            pertenece = PreguntaCuestionario.objects.create_pregunta_cuestionario(
                puntosAcierto=pregunta["punt_positiva"],
                puntosFallo=pregunta["punt_negativa"],
                idCuestionario=cuestionario.id,
                idPregunta=Pregunta.objects.get_by_id(id_pregunta=pregunta["id"]).id,
                orden=i,
                fijar=pregunta["fijar"] if ("fijar" in pregunta) else False,
            )
            pertenece.save()

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
        alumno = request.user
        intento = Intento.objects.get_by_cuestionario_alumno(id_cuestionario=id_cuestionario, id_alumno=alumno.id)

        nota = 0
        for key, respuesta in respuestas.items():
            print(respuesta)
            pregunta = Pregunta.objects.get_by_id(id_pregunta=respuesta["id"])

            if respuesta["type"] == "test" and str(respuesta["answr"]).isdigit():
                opcion = OpcionTest.objects.get_by_id(id_opciones=respuesta["answr"])
                respuesta_enviada = InstanciaPreguntaTest.objects.get_by_intento_pregunta(intento.id, pregunta.id)
                respuesta_enviada.respuesta = opcion

            if respuesta["type"] == "text":
                respuesta_enviada = InstanciaPreguntaText.objects.get_by_intento_pregunta(intento.id, pregunta.id)
                respuesta_enviada.respuesta = respuesta["answr"]
                respuesta_enviada.save()

            nota = nota + InstanciaPregunta.calcular_nota(respuesta, id_cuestionario)

        intento.nota = nota
        intento.estado = Intento.Estado.ENTREGADO
        intento.save()
        return Response({"nota": nota})

    @action(detail=True, methods=["GET"], url_path=r"nota/(?P<id_alumno>\d+)")
    def nota(self, request, pk, id_alumno):
        """TODO ruta un poco extraña pensar alternativa
        GET /tests/{id_cuestionario}/nota/{id_alumno}
        """
        if request.user.role != User.TEACHER:
            return Response(status=status.HTTP_403_FORBIDDEN)

        cuestionario = Cuestionario.objects.get_by_id(id_cuestionario=pk)
        pertenecen = PreguntaCuestionario.objects.get_by_cuestionario(id_cuestionario=cuestionario.id)
        intento_obj = Intento.objects.get_by_cuestionario_alumno(id_cuestionario=pk, id_alumno=id_alumno)

        questions = []
        for pertenece in pertenecen:
            pregunta = pertenece.pregunta
            pregunta_json = {}
            pregunta_json["id"] = pregunta.id
            pregunta_json["question"] = pregunta.pregunta
            if hasattr(pregunta, "preguntatest"):
                pregunta_json["type"] = "test"
                opciones_lista = []
                opciones = OpcionTest.objects.get_by_pregunta(id_pregunta=pregunta.id)
                for opcion in opciones:
                    opciones_lista.append({"id": opcion.id, "op": opcion.opcion})
                pregunta_json["options"] = opciones_lista
                pregunta_json["correct_op"] = PreguntaTest.objects.get_by_id(id_pregunta=pregunta.id).respuesta.id
                # TODO esto es un apaño para qe funcione hay que reescribirlo todo
                pregunta_json["user_op"] = InstanciaPreguntaTest.objects.get_by_intento_pregunta(id_intento=intento_obj.id, id_pregunta=pregunta.id)
                if pregunta_json["user_op"] is not None:
                    pregunta_json["user_op"] = pregunta_json["user_op"].respuesta.id
            if hasattr(pregunta, "preguntatext"):
                pregunta_json["type"] = "text"
                pregunta_json["correct_op"] = PreguntaText.objects.get_by_id(id_pregunta=pregunta.id).respuesta
                pregunta_json["user_op"] = InstanciaPreguntaText.objects.get_by_intento_pregunta(id_intento=intento_obj.id, id_pregunta=pregunta.id)
                if pregunta_json["user_op"] is not None:
                    pregunta_json["user_op"] = pregunta_json["user_op"].respuesta
            questions.append(pregunta_json)

        message_json = {}
        message_json["titulo"] = cuestionario.titulo
        message_json["nota"] = intento_obj.nota
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
        if request.user.role != User.TEACHER:
            return Response(status=status.HTTP_403_FORBIDDEN)

        cuestionario = Cuestionario.objects.get_by_id(id_cuestionario=pk)

        alumnos = User.objects.get_users_from_test(id_asignatura=cuestionario.asignatura.id, id_cuestionario=pk)
        notas = []
        for alumno in alumnos:
            nota = "No presentado" if alumno["intento__nota"] is None else alumno["intento__nota"]
            notas.append({"id": alumno["id"], "nombre": alumno["first_name"], "apellidos": alumno["last_name"], "nota": nota})
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
        fecha_visible = cuestionario.fecha_visible
        nota_cuestionario = 0
        try:
            # TODO no creo que este arreglado y no entiendo bien a que se refiere
            # -----
            # Corregir Un alumno solo puede tener una nota para un cuestionario, solo puede hacer un cuestionrio una vez
            # ......
            nota = Intento.objects.get_by_cuestionario_alumno(id_cuestionario=pk, id_alumno=request.user.id)  # <-- Salta excepcion si devuelve mas de uno
            corregido = 1
            nota_cuestionario = nota.nota
        except:
            corregido = 0
        print(fecha_cierre.strftime(TIME_FORMAT), fecha_cierre)
        return Response(
            {
                "duracion": duracion,
                "formatted_fecha_apertura": fecha_apertura.strftime(TIME_FORMAT),
                "formatted_fecha_cierre": fecha_cierre.strftime(TIME_FORMAT),
                "formatted_fecha_visible": fecha_visible.strftime(TIME_FORMAT),
                "fecha_apertura": fecha_apertura,
                "fecha_cierre": fecha_cierre,
                "fecha_visible": fecha_visible,
                "corregido": corregido,
                "nota": nota_cuestionario,
            }
        )

    @action(detail=False, methods=["POST"])
    def subir(self, request):
        """
        POST /upload -> POST /tests/upload
        """
        if str(request.user.role) == User.STUDENT:
            content = {
                "inserted": "false",
                "message": "Error: Para poder crear tests debes de ser administrador o profesor.",
            }
            return Response(content, status=status.HTTP_403_FORBIDDEN)

        try:
            yaml_cuestionario = yaml.safe_load(request.data["fichero_yaml"])
        except yaml.YAMLError:
            content = {
                "inserted": "false",
                "message": "Error: El cuestionario está mal formado. Por favor, revisa que lo hayas escrito bien.",
            }
            return Response(content, status=status.HTTP_400_BAD_REQUEST)
        # 1. Generamos el test
        fecha_apertura = yaml_cuestionario["cuestionario"]["fecha_apertura"]
        passw = yaml_cuestionario["cuestionario"]["password"]
        date_time_apertura = make_aware(datetime.strptime(fecha_apertura, "%y/%m/%d %H:%M:%S"))
        fecha_cierre = yaml_cuestionario["cuestionario"]["fecha_cierre"]
        date_time_cierre = make_aware(datetime.strptime(fecha_cierre, "%y/%m/%d %H:%M:%S"))
        fecha_visible = yaml_cuestionario["cuestionario"]["fecha_visible"]
        date_time_visible = make_aware(datetime.strptime(fecha_visible, "%y/%m/%d %H:%M:%S"))
        title = yaml_cuestionario["cuestionario"]["titulo"]
        nombre_asig = yaml_cuestionario["cuestionario"]["asignatura"]
        profesor = request.user
        sec = yaml_cuestionario["cuestionario"]["secuencial"]
        durat = yaml_cuestionario["cuestionario"]["duracion"]
        aleatorizar = yaml_cuestionario["cuestionario"]["aleatorizar"] if ("aleatorizar" in yaml_cuestionario["cuestionario"]) else False

        try:
            asignatura = Asignatura.objects.get_by_asignatura(nombre_asignatura=nombre_asig)
        except Exception as e:
            content = {
                "inserted": "false",
                "message": f"Error: La asignatura {nombre_asig} no existe!",
            }
            return Response(content, status=status.HTTP_400_BAD_REQUEST)

        cuestionario = Cuestionario.objects.create_cuestionarios(
            titulo=title,
            secuencial=sec,
            idAsignatura=asignatura.id,
            idProfesor=profesor.id,
            duracion=durat,
            password=passw,
            fecha_cierre=date_time_cierre,
            fecha_apertura=date_time_apertura,
            fecha_visible=date_time_visible,
            aleatorizar=aleatorizar,
        )
        try:
            cuestionario.save()
        except:
            content = {
                "inserted": "false",
                "message": "Error: El cuestionario ya existe",
            }
            return Response(content, status=status.HTTP_400_BAD_REQUEST)

        preguntas = yaml_cuestionario["cuestionario"]["preguntas"]

        for i, preg in enumerate(preguntas):
            try:
                pregunta = Pregunta.objects.create_preguntas(
                    pregunta=preg["pregunta"],
                    idAsignatura=asignatura.id,
                    titulo=preg["titulo"],
                )
                pregunta.save()
            except Exception as e:
                continue

            pertenece = PreguntaCuestionario.objects.create_pregunta_cuestionario(
                puntosAcierto=preg["punt_positiva"],
                puntosFallo=preg["punt_negativa"],
                idCuestionario=cuestionario.id,
                idPregunta=pregunta.id,
                orden=i,
                fijar=preg["fijar"] if ("fijar" in preg) else False,
            )
            pertenece.save()

            pregunta = Pregunta.objects.get_by_asignatura_pregunta_titulo(
                pregunta=preg["pregunta"],
                id_asignatura=asignatura.id,
                titulo=preg["titulo"],
            )
            # Guardamos las opciones
            if preg["tipo"] == "test":

                preguntaTest = PreguntaTest.objects.create_pregunta_test(pregunta=preg["pregunta"], idAsignatura=asignatura.id, titulo=preg["titulo"], id_pregunta=pregunta.id)

                preguntaTest.save()

                opciones = preg["opciones"]
                for index, opc in enumerate(opciones):
                    opcion = OpcionTest.objects.create_opciones_test(opcion=opc["op"], idPregunta=pregunta.id, orden=index, fijar=opc["fijar"] if ("fijar" in opc) else False)
                    try:
                        opcion.save()
                        if index == preg["op_correcta"]:
                            preguntaTest.respuesta_id = opcion.id
                            preguntaTest.save()
                    except Exception as e:
                        print("La pregunta ya existia")

            elif preg["tipo"] == "text":
                preguntaText = PreguntaText.objects.create_pregunta_text(
                    pregunta=preg["pregunta"], idAsignatura=asignatura.id, titulo=preg["titulo"], id_pregunta=pregunta.id, respuesta=preg["opciones"]
                )
                preguntaText.save()

        content = {
            "inserted": "true",
            "message": "El cuestionario se ha insertado correctamente",
        }
        return Response(content)
