import re
import xml.etree.ElementTree as ET

import yaml
from api.models import (
    Asignatura,
    OpcionTest,
    Pregunta,
    PreguntaTest,
    PreguntaText,
    User,
)
from drf_spectacular.utils import (
    OpenApiExample,
    OpenApiParameter,
    OpenApiResponse,
    extend_schema,
    extend_schema_view,
)
from rest_framework import viewsets
from rest_framework.response import Response


@extend_schema_view(
    create=extend_schema(
        summary="Crear preguntas a partir de un fichero csv o xml",
        request={
            "multipart/form-data": {"type": "object", "properties": {"file": {"type": "string", "format": "binary"}}},
        },
        responses={
            200: OpenApiResponse(
                response={"type": "object", "properties": {"inserted": {"type": "string"}, "message": {"type": "string"}}},
                examples=[
                    OpenApiExample(
                        "QR_INSERTED",
                        value={"inserted": True, "message": "¡El hash se ha insertado correctamente!"},
                        status_codes=[200],
                        response_only=True,
                    )
                ],
            ),
        },
    ),
    update=extend_schema(
        summary="Actualizar una pregunta",
        parameters=[
            OpenApiParameter(name="id", type=int, location=OpenApiParameter.PATH, description="Id de la pregunta"),
        ],
        responses={200: OpenApiResponse(response={"type": "object", "properties": {"message": {"type": "string"}}})},
    ),
    destroy=extend_schema(
        summary="Borrar una pregunta",
        parameters=[
            OpenApiParameter(name="id", type=int, location=OpenApiParameter.PATH, description="Id de la pregunta"),
        ],
        responses={200: OpenApiResponse(response={"type": "object", "properties": {"message": {"type": "string"}}})},
    ),
)
class QuestionViewSet(viewsets.ViewSet):
    permission_classes = []

    def create(self, request):
        if str(request.user.role) == User.STUDENT:  # TODO controlar con permisos
            content = {
                "inserted": "false",
                "message": "Error: Para poder subir preguntas debes de ser administrador o profesor.",
            }
            return Response(content)

        id_asignatura = request.data["idAsignatura"]
        try:
            asignatura = Asignatura.objects.get_by_id(id_asignatura=id_asignatura)
        except:
            content = {"inserted": "false", "message": f"Error: La asignatura {id_asignatura} no existe!"}
            return Response(content)

        es_yaml = None
        preguntas = None
        fichero = request.FILES["fichero_yaml"]
        if fichero.name.split(".")[1] == "xml":
            es_yaml = False
            tree = ET.parse(fichero)
            quiz = tree.getroot()
            preguntas = quiz.findall("question")
        elif fichero.name.split(".")[1] == "yml":
            es_yaml = True
            try:
                yamlplscomeon = yaml.load(request.data["fichero_yaml"], Loader=yaml.FullLoader)
            except:
                content = {
                    "inserted": "false",
                    "message": "Error: El cuestionario está mal formado. Por favor, revisa que lo hayas escrito bien.",
                }
                return Response(content)
            preguntas = yamlplscomeon["preguntas"]

        for question in preguntas:
            if es_yaml:
                p_texto = question["pregunta"]
                p_titulo = question["titulo"]
                p_tipo_test = question["tipo"] == "test"
                p_tipo_text = question["tipo"] == "text"
                p_opciones = question["opciones"]
                p_respuesta_text = question["opciones"]
            else:
                p_texto = re.sub(r"<.*?>", "", question.find("questiontext/text").text)
                p_titulo = question.find("name/text").text
                p_tipo_test = question.attrib["type"] == "multichoice"
                p_tipo_text = question.attrib["type"] == "shortanswer"
                p_opciones = question.findall("answer")
                p_respuesta_text = question.find("answer/text").text

            try:
                pregunta = Pregunta.objects.create_preguntas(
                    pregunta=p_texto,
                    idAsignatura=asignatura.id,
                    titulo=p_titulo,
                )
                pregunta.save()
            except Exception as exc:  # TODO hay que controlar mejor excepciones ni sabia que saltaba excepcion
                print(exc)
                continue
                # Guardamos las opciones
            if p_tipo_test:
                pregunta_test = PreguntaTest.objects.create_pregunta_test(pregunta=p_texto, idAsignatura=asignatura.id, titulo=p_titulo, id_pregunta=pregunta.id)

                try:
                    pregunta_test.save()
                except Exception as e:
                    print(e)

                opciones = p_opciones
                for index, opc in enumerate(opciones):
                    if es_yaml:
                        p_opc = opc["op"]
                        p_fijar = opc["fijar"] if ("fijar" in opc) else False
                        p_correcta = index == question["op_correcta"]
                    else:
                        p_opc = re.sub(r"<.*?>", "", opc.find("text").text)
                        p_fijar = False
                        p_correcta = opc.attrib["fraction"] == "100"
                    opcion = OpcionTest.objects.create_opciones_test(opcion=p_opc, idPregunta=pregunta.id, orden=index, fijar=p_fijar)
                    try:
                        opcion.save()
                        if p_correcta:
                            pregunta_test.respuesta_id = opcion.id
                            pregunta_test.save()
                    except Exception as e:
                        print(e)
                        print("La pregunta ya existia")

            elif p_tipo_text:
                pregunta_text = PreguntaText.objects.create_pregunta_text(
                    pregunta=p_texto, idAsignatura=asignatura.id, titulo=p_titulo, id_pregunta=pregunta.id, respuesta=p_respuesta_text
                )
                pregunta_text.save()

        content = {
            "inserted": "true",
            "message": "Las preguntas se han insertado correctamente",
        }
        return Response(content)

    def update(self, request, pk):
        if str(request.user.role) == User.STUDENT:
            content = {"message": "Error: Para actualizar una pregunta debes ser un profesor."}
            return Response(content)
        updated_question = request.data["preguntaActualizada"]

        pregunta = Pregunta.objects.get_by_id(id_pregunta=pk)  # TODO cambiar al servicio
        pregunta.titulo = updated_question["title"]
        pregunta.pregunta = updated_question["question"]
        pregunta.save(update_fields=["titulo", "pregunta"])

        if updated_question["type"] == "test":
            for option in updated_question["options"]:
                option_obj = OpcionTest.objects.get_by_id(id_opciones=option["id"])
                option_obj.opcion = option["op"]  # TODO añadir para que pueda añadir más respuestas
                option_obj.save(update_fields=["opcion"])

            pregunta_test = PreguntaTest.objects.get_by_id(id_pregunta=pk)
            pregunta_test.respuesta = OpcionTest.objects.get_by_id(id_opciones=updated_question["correct_op"])
            pregunta_test.save(update_fields=["respuesta"])

        elif updated_question["type"] == "text":
            pregunta_text = PreguntaText.objects.get_by_id(id_pregunta=pk)
            pregunta_text.respuesta = updated_question["correct_op"]
            pregunta_text.save(update_fields=["respuesta"])

        content = {
            "message": "Pregunta actualizada correctamente",
        }
        return Response(content)

    def destroy(self, request, pk):
        if str(request.user.role) == User.STUDENT:
            content = {"message": "Error: Para eliminar una pregunta debes ser un profesor."}
            return Response(content)

        pregunta = Pregunta.objects.get_by_id(id_pregunta=pk)
        pregunta.delete()  # TODO comprobar que pasa aqui con los hijos

        content = {
            "message": "Pregunta eliminada correctamente",
        }
        return Response(content)
