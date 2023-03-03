import random
from datetime import datetime
from drf_spectacular.utils import extend_schema, extend_schema_view

import yaml
from api.models import Asignatura, Cuestionario, InstanciaPreguntaTest, InstanciaPreguntaText, Intento, OpcionTest, Pregunta, SeleccionPregunta, PreguntaTest, PreguntaText, User
from api.utils.cifrado import encrypt_tests
from django.utils.timezone import make_aware
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from ..models import (
    Asignatura,
    Cuestionario,
    Imparte,
    InstanciaOpcionTest,
    InstanciaPregunta,
    InstanciaPreguntaTest,
    InstanciaPreguntaText,
    Intento,
    OpcionTest,
    Pregunta,
    SeleccionPregunta,
    OpcionPreguntaAleatoria,
    User,
)
from ..serializer import (
    CuestionarioSerializer,
    EncryptedTestsSerializer,
    InstanciaOpcionSerializer,
    InstanciaPreguntaSerializer,
    SeleccionPreguntaSerializer,
    PreguntasSerializer,
)


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

def save_question(pregYaml, pregunta, asignatura):
    
    if pregunta is None:
        pregunta = Pregunta.objects.create_preguntas(idAsignatura=asignatura.id, titulo=pregYaml["titulo"], pregunta=pregYaml["pregunta"])

    # Guardamos las opciones
    if pregYaml["tipo"] == "test":
        pregunta_test = PreguntaTest.objects.create_pregunta_test(pregunta=pregYaml["pregunta"], idAsignatura=asignatura.id, titulo=pregYaml["titulo"], id_pregunta=pregunta.id)
        pregunta_test.save()

        opciones = pregYaml["opciones"]
        for index, opc in enumerate(opciones):
            opcion = OpcionTest.objects.create_opciones_test(opcion=opc["op"], idPregunta=pregunta.id, orden=index, fijar=opc["fijar"] if ("fijar" in opc) else False)
            try:
                opcion.save()
                if index == pregYaml["op_correcta"]:
                    pregunta_test.respuesta_id = opcion.id
                    pregunta_test.save()
            except Exception:
                print("La pregunta ya existia")

    elif pregYaml["tipo"] == "text":
        pregunta_text = PreguntaText.objects.create_pregunta_text(
            pregunta=pregYaml["pregunta"], idAsignatura=asignatura.id, titulo=pregYaml["titulo"], id_pregunta=pregunta.id, respuesta=pregYaml["opciones"]
        )
        pregunta_text.save()    

    return pregunta


# TODO faltan schemas
@extend_schema_view(
    retrieve=extend_schema(
        summary="Descargar cuestionario",
    ),
    create=extend_schema(
        summary="Crear cuestionario",
    ),
    enviar=extend_schema(
        summary="Responder a un cuestionario",
    ),
    nota=extend_schema(
        summary="Nota de un cuestionario de un estudiante",
        description="También se devuelven las respuestas del usuario",
    ),
    notas=extend_schema(
        summary="Lista de notas de todos los alumnos de un cuestionario",
    ),
    info=extend_schema(
        summary="Información de un cuestionario para un alumno",
    ),
    subir=extend_schema(
        summary="Creación de un cuestionario a partir de un yaml",
    )
)
# TODO No se han indicado permisos todavia
class TestsViewSet(mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    queryset = Cuestionario.objects.all()
    serializer_class = EncryptedTestsSerializer
    permission_classes = []
    # TODO cambiar a POST
    def retrieve(self, request, pk):
        try:
            cuestionario = Cuestionario.objects.get_by_id(id_cuestionario=pk)
        except:
            return Response(status=status.HTTP_400_BAD_REQUEST)


        # Comprobar si es la primera vez que el alumno pide el cuestionario para crearle su propio orden de preguntas
        try:
            intento = Intento.objects.get_by_cuestionario_alumno(id_cuestionario=pk, id_alumno=request.user.id)  # TODO se puede crear metodo para exists
        except Intento.DoesNotExist:
            intento = None

        if intento:
            # Serializar las preguntas
            res = []
            for inst in InstanciaPregunta.objects.get_by_intento(id_intento=intento.id):
                pertenece = inst.pregunta
                inst_serialzed = PreguntasSerializer(inst.pregunta.pregunta).data
                inst_serialzed["fijar"], inst_serialzed["orden"], inst_serialzed["aleatorizar"] = pertenece.fijar, pertenece.orden, pertenece.aleatorizar
                res.append(inst_serialzed)

            # Recuperar orden de las preguntas
            for preg in res.copy():
                override = InstanciaPreguntaSerializer(InstanciaPregunta.objects.get_by_intento_pregunta(id_intento=intento.id, id_pregunta=preg["id"])).data
                preg["orden"] = override["orden"]
                res[preg["orden"]] = preg
                if preg["tipoPregunta"] == "test":
                    for opc in preg["opciones_test"].copy():
                        opc_override = InstanciaOpcionSerializer(InstanciaOpcionTest.objects.get_by_instpregunta_opcion(id_instpregunta=override["id"], id_opcion=opc["id"])).data
                        opc["orden"] = opc_override["orden"]
                        res[preg["orden"]]["opciones_test"][opc["orden"]] = opc
        else:
            res = []
            for inst in SeleccionPregunta.objects.get_by_cuestionario(id_cuestionario=cuestionario.id):
                if inst.tipo == SeleccionPregunta.Tipo.PREGALEATORIA:
                    lista = OpcionPreguntaAleatoria.objects.get_by_pregunta_aleatoria(id_pregunta_aleatoria=inst.id)
                    print(lista)
                    id_elegida = random.choice([i.id for i in lista])
                    pregunta_elegida = Pregunta.objects.get_by_id(id_elegida)
                    pregunta = pregunta_elegida
                else:
                    pregunta = inst.pregunta
                preg = PreguntasSerializer(pregunta).data
                preg["fijar"], preg["orden"], preg["aleatorizar"] = inst.fijar, inst.orden, inst.aleatorizar
                res.append(preg)


            # TODO arreglar en algun momento
            #Ordenar lista segun campo orden
            for preg in res.copy():
                res[preg["orden"]] = preg

            # Aleatorizar las preguntas, reordenar elementos no fijos
            if cuestionario.aleatorizar:
                for i, elem in shuffle(res):
                    res[i] = elem
                    res[i]["orden"] = i
                    if elem["tipoPregunta"] == "test" and elem["aleatorizar"]:
                        for j, opc in shuffle(res[i]["opciones_test"]):
                            res[i]["opciones_test"][j] = opc
                            res[i]["opciones_test"][j]["orden"] = j

            # Guardar el orden aleatorio para el alumno
            intento = Intento.objects.create_intento(idAlumno=request.user.id, idCuestionario=cuestionario.id, commit=True)
            for preg in res:
                if preg["tipoPregunta"] == "test":
                    inst = InstanciaPreguntaTest.objects.create_instancia(id_intento=intento.id, id_pregunta=preg["id"], id_respuesta=None, orden=preg["orden"], commit=True)
                    for opc in preg["opciones_test"]:
                        InstanciaOpcionTest.objects.create_instancia(id_instancia=inst.id, id_opcion=opc["id"], orden=opc["orden"], commit=True)
                if preg["tipoPregunta"] == "text":
                    InstanciaPreguntaText.objects.create_instancia(id_intento=intento.id, id_pregunta=preg["id"], respuesta=None, orden=preg["orden"], commit=True)
                

        # Encriptar tests
        # Añadir atributos del cuestionario
        quiz_encrypt = {**CuestionarioSerializer(cuestionario).data}
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
            return Response(
                {
                    "inserted": "false",
                    "message": "Error: Para poder crear tests debes de ser administrador o profesor.",
                }
            )

        profesor = request.user

        cuestionario_data = request.data["cuestionario"]
        title = cuestionario_data["testName"]
        passw = cuestionario_data["testPass"]
        id_asignatura = cuestionario_data["testSubject"]
        sec = cuestionario_data["secuencial"]
        durat = cuestionario_data["testDuration"]
        date_time_apertura = make_aware(datetime.fromtimestamp(cuestionario_data["fechaApertura"] / 1000))
        date_time_cierre = make_aware(datetime.fromtimestamp(cuestionario_data["fechaCierre"] / 1000))
        date_time_visible = make_aware(datetime.fromtimestamp(cuestionario_data["fechaVisible"] / 1000))
        lista_preguntas = cuestionario_data["questionList"]
        aleatorizar = cuestionario_data["aleatorizar"] if ("aleatorizar" in cuestionario_data) else False

        try:
            asignatura = Asignatura.objects.get_by_id(id_asignatura=id_asignatura)
        except:
            return Response({"inserted": "false", "message": "Error: La asignatura no existe!"})

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
            return Response({"inserted": "false", "message": "Error: El cuestionario ya existe"})

        keys_preg = {
            "aleatoria": SeleccionPregunta.Tipo.PREGALEATORIA,
            "test": SeleccionPregunta.Tipo.PREGBANCO,
            "text": SeleccionPregunta.Tipo.PREGBANCO
        }
        for i, pregunta in enumerate(lista_preguntas):
            tipo_seleccionada = keys_preg[pregunta["tipo"]] if pregunta["tipo"] in keys_preg else None # TODO tratamiento de excepciones 
            if tipo_seleccionada is None:
                continue
            pertenece = SeleccionPregunta.objects.create_seleccion_pregunta(
                puntosAcierto=pregunta["punt_positiva"],
                puntosFallo=pregunta["punt_negativa"],
                idCuestionario=cuestionario.id,
                idPregunta=pregunta["id"] if pregunta["tipo"] != "aleatoria" else None,
                orden=i,
                fijar=pregunta["fijar"] if ("fijar" in pregunta) else False,
                aleatorizar=pregunta["aleatorizar"] if ("aleatorizar" in pregunta) else False,
                tipo=tipo_seleccionada
            )
            pertenece.save()

            if tipo_seleccionada == SeleccionPregunta.Tipo.PREGALEATORIA:
                for preg in pregunta["preguntas_elegidas"]:
                    opcion_preg_aleatoria = OpcionPreguntaAleatoria.objects.create_opcion_pregunta_aleatoria(
                        id_pregunta = preg,
                        id_pregunta_aleatoria = pertenece.id
                    )
                    opcion_preg_aleatoria.save()

        return Response(
            {
                "inserted": "true",
                "message": "El cuestionario se ha insertado correctamente",
            }
        )

    @action(detail=True, methods=["POST"])
    def enviar(self, request, pk):  # pylint: disable=method-hidden,invalid-name
        """
        POST /enviar -> POST /tests/1/enviar
        """
        respuestas = request.data["respuestas"]
        hash_enviado = request.data["hash"]
        id_cuestionario = pk
        alumno = request.user
        try:
            intento = Intento.objects.get_by_cuestionario_alumno(id_cuestionario=id_cuestionario, id_alumno=alumno.id)
        except Intento.DoesNotExist:
            return Response(data="No se pueden enviar respuestas sin haber comenzado el intento.", status=status.HTTP_400_BAD_REQUEST)

        nota = 0
        for key, respuesta in respuestas.items():
            pregunta = Pregunta.objects.get_by_id(id_pregunta=respuesta["id"])

            if respuesta["type"] == "test" and str(respuesta["answr"]).isdigit():
                opcion = OpcionTest.objects.get_by_id(id_opciones=respuesta["answr"])
                respuesta_enviada = InstanciaPreguntaTest.objects.get_by_intento_pregunta(intento.id, pregunta.id)
                respuesta_enviada.respuesta = opcion
                respuesta_enviada.save()

            if respuesta["type"] == "text":
                respuesta_enviada = InstanciaPreguntaText.objects.get_by_intento_pregunta(intento.id, pregunta.id)
                respuesta_enviada.respuesta = respuesta["answr"]
                respuesta_enviada.save()

            nota = nota + InstanciaPregunta.calcular_nota(respuesta, id_cuestionario)

        intento.nota = nota
        intento.hash = hash_enviado
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
        pertenecen = SeleccionPregunta.objects.get_by_cuestionario(id_cuestionario=cuestionario.id)
        try:
            intento_obj = Intento.objects.get_by_cuestionario_alumno(id_cuestionario=pk, id_alumno=id_alumno)
        except:
            return Response(data="El usuario no ha realizado ningun intento", status=status.HTTP_400_BAD_REQUEST)

        questions = []
        for pertenece in pertenecen:
            pregunta = pertenece.pregunta
            pregunta_json = {"id": pregunta.id, "question": pregunta.pregunta}
            if hasattr(pregunta, "preguntatest"):
                pregunta_json["type"] = "test"
                opciones = OpcionTest.objects.get_by_pregunta(id_pregunta=pregunta.id)
                pregunta_json["options"] = [{"id": opcion.id, "op": opcion.opcion} for opcion in opciones]
                pregunta_json["correct_op"] = PreguntaTest.objects.get_by_id(id_pregunta=pregunta.id).respuesta.id
                # TODO esto es un apaño para qe funcione hay que reescribirlo todo
                pregunta_json["user_op"] = InstanciaPreguntaTest.objects.get_by_intento_pregunta(id_intento=intento_obj.id, id_pregunta=pregunta.id)
                if pregunta_json["user_op"].respuesta is not None:
                    pregunta_json["user_op"] = pregunta_json["user_op"].respuesta.id
                else:
                    pregunta_json["user_op"] = None
            if hasattr(pregunta, "preguntatext"):
                pregunta_json["type"] = "text"
                pregunta_json["correct_op"] = PreguntaText.objects.get_by_id(id_pregunta=pregunta.id).respuesta
                pregunta_json["user_op"] = InstanciaPreguntaText.objects.get_by_intento_pregunta(id_intento=intento_obj.id, id_pregunta=pregunta.id)
                if pregunta_json["user_op"] is not None:
                    pregunta_json["user_op"] = pregunta_json["user_op"].respuesta
                else:
                    pregunta_json["user_op"] = None
            questions.append(pregunta_json)

        return Response(
            {
                "titulo": cuestionario.titulo,
                "nota": intento_obj.nota,
                "questions": questions,
            }
        )

    @action(detail=True, methods=["GET"])
    def notas(self, request, pk):
        """
        POST /get-quiz-grades -> GET /tests/{pk}/grades
        """
        if request.user.role != User.TEACHER:
            return Response(status=status.HTTP_403_FORBIDDEN)

        cuestionario = Cuestionario.objects.get_by_id(id_cuestionario=pk)

        alumnos = User.objects.get_users_from_test(id_asignatura=cuestionario.asignatura.id, id_cuestionario=pk)
        notas = {}
        for alumno in alumnos:
            nota = "No presentado" if alumno["intento__nota"] is None else alumno["intento__nota"]
            notas[alumno["email"]] = ({"id": alumno["id"], "nombre": alumno["first_name"], "apellidos": alumno["last_name"], "nota": nota})
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
            return Response(
                {
                    "inserted": "false",
                    "message": "Error: Para poder crear tests debes de ser administrador o profesor.",
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            Imparte.objects.get_by_profesor(id_profesor=request.user.id)
        except Imparte.DoesNotExist:
            return Response(
                {
                    "inserted": "false",
                    "message": "Error: Es necesario impartir la asignatura para crear tests.",
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            yaml_cuestionario = yaml.safe_load(request.data["fichero_yaml"])
        except yaml.YAMLError:
            return Response(
                {
                    "inserted": "false",
                    "message": "Error: El cuestionario está mal formado. Por favor, revisa que lo hayas escrito bien.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 1. Generamos el test
        passw = yaml_cuestionario["cuestionario"]["password"]
        date_time_apertura = make_aware(datetime.strptime(yaml_cuestionario["cuestionario"]["fecha_apertura"], "%y/%m/%d %H:%M:%S"))
        date_time_cierre = make_aware(datetime.strptime(yaml_cuestionario["cuestionario"]["fecha_cierre"], "%y/%m/%d %H:%M:%S"))
        date_time_visible = make_aware(datetime.strptime(yaml_cuestionario["cuestionario"]["fecha_visible"], "%y/%m/%d %H:%M:%S"))
        title = yaml_cuestionario["cuestionario"]["titulo"]
        nombre_asig = yaml_cuestionario["cuestionario"]["asignatura"]
        sec = yaml_cuestionario["cuestionario"]["secuencial"]
        durat = yaml_cuestionario["cuestionario"]["duracion"]
        aleatorizar = yaml_cuestionario["cuestionario"]["aleatorizar"] if ("aleatorizar" in yaml_cuestionario["cuestionario"]) else False
        profesor = request.user

        try:
            asignatura = Asignatura.objects.get_by_asignatura(nombre_asignatura=nombre_asig)
        except Asignatura.DoesNotExist:
            return Response(
                {
                    "inserted": "false",
                    "message": f"Error: La asignatura {nombre_asig} no existe!",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

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
            return Response(
                {
                    "inserted": "false",
                    "message": "Error: El cuestionario ya existe",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        for i, pregYaml in enumerate(yaml_cuestionario["cuestionario"]["preguntas"]):
            pregunta = None
            try:
                if pregYaml["tipo"] != "aleatoria":
                    pregunta = Pregunta.objects.create_preguntas(
                        pregunta=pregYaml["pregunta"],
                        idAsignatura=asignatura.id,
                        titulo=pregYaml["titulo"],
                    )
                    pregunta.save()
                # TODO esto pa k eeh
            except Exception:
                pregunta = Pregunta.objects.get_by_asignatura_pregunta_titulo(pregunta=pregYaml["pregunta"], id_asignatura=asignatura.id, titulo=pregYaml["titulo"])

            pertenece = SeleccionPregunta.objects.create_seleccion_pregunta(
                puntosAcierto=pregYaml["punt_positiva"],
                puntosFallo=pregYaml["punt_negativa"],
                idCuestionario=cuestionario.id,
                idPregunta=pregunta.id if pregYaml["tipo"] != "aleatoria" else None,
                orden=i,
                fijar=pregYaml["fijar"] if ("fijar" in pregYaml) else False,
                aleatorizar=pregYaml["aleatorizar"] if ("aleatorizar" in pregYaml) else False,
                tipo = SeleccionPregunta.Tipo.PREGALEATORIA if (pregYaml["tipo"] == "aleatoria") else SeleccionPregunta.Tipo.PREGBANCO 
            )
            pertenece.save()

            if pertenece.tipo == SeleccionPregunta.Tipo.PREGALEATORIA:
                for pregSeleccionada in pregYaml["preguntas_elegidas"]:
                    if "ref" in pregSeleccionada:
                        try:
                            preguntaSelec = Pregunta.objects.get_by_id(id_pregunta=pregSeleccionada["ref"]) 
                            OpcionPreguntaAleatoria.objects.create_opcion_pregunta_aleatoria(id_pregunta=preguntaSelec.id, id_pregunta_aleatoria=pertenece.id)
                        except Exception:
                            return Response(
                                {
                                "inserted": "false",
                                "message": "Error: La pregunta seleccionada no existe",
                                },
                                status=status.HTTP_400_BAD_REQUEST,
                                )
                    else:
                        preguntaNueva = save_question(pregYaml,pregunta,asignatura)
                        OpcionPreguntaAleatoria.objects.create_opcion_pregunta_aleatoria(id_pregunta=preguntaNueva.id, id_pregunta_aleatoria=pertenece.id)                        
            if pertenece.tipo == SeleccionPregunta.Tipo.PREGBANCO:
                save_question(pregYaml,pregunta,asignatura)

        return Response(
            {
                "inserted": "true",
                "message": "El cuestionario se ha insertado correctamente",
            }
        )
