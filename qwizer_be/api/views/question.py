import re
import xml.etree.ElementTree as ET

import base64
import yaml
from api.models import (
    Asignatura,
    Imparte,
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
from rest_framework import viewsets,status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.core.files.storage import FileSystemStorage
from django.db import transaction, IntegrityError

def comprobar_imagenes(imagenes_form,imagenes_pregunta):
    for img in imagenes_pregunta:
        if img[1] not in (str(item) for item in imagenes_form):
            raise Exception(f"No se ha encontrado la imagen {img[1]} dentro de las imagenes subida")

def exception_block(imagenes_guardadas, exception): #TODO preguntar tibi rollback
    fs = FileSystemStorage()
    for i in imagenes_guardadas:
        fs.delete(i)
    transaction.rollback()
    content = {
    "inserted": "false",
    "message": "Error: " + exception.args[0],
    }
    return Response(content) 


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

    @transaction.atomic
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
                        
        sv_create_question = transaction.savepoint()

        try:
            Imparte.objects.get_by_profesor_in_asignatura(id_profesor=request.user.id, id_asignatura=asignatura.id)
        except Imparte.DoesNotExist:
            return Response(
                {
                    "inserted": "false",
                    "message": "Error: Es necesario impartir la asignatura para crear preguntas del banco.",
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        es_yaml = None
        preguntas = None
        fichero = request.FILES["fichero_yaml"]
        imagenes_form = request.FILES.getlist('images')
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

        fs = FileSystemStorage()
        imagenes_guardadas = []
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
                imagenes_pregunta =  re.findall(r"!\[(.*?)\]\(([\w\/\-\:\._]+?)\)", p_texto)
                if len(imagenes_pregunta) > 0:
                    comprobar_imagenes(imagenes_form, imagenes_pregunta)
                    for img in imagenes_form:
                        name = str(img)
                        if re.search(name,p_texto):
                            store_name = fs.save(name, img)
                            imagenes_guardadas.append(store_name)
                            p_texto = p_texto.replace(name, store_name)
                pregunta = Pregunta.objects.create_preguntas(
                    pregunta=p_texto,
                    idAsignatura=asignatura.id,
                    titulo=p_titulo,
                )
                pregunta.save()
            except Exception as exc:  # TODO hay que controlar mejor excepciones ni sabia que                     
                for i in imagenes_guardadas:
                    fs.delete(i)
                transaction.savepoint_rollback(sv_create_question)
                content = {
                "inserted": "false",
                "message": "Error: " + exc.args[0],
                }
                return Response(content)
            
                # Guardamos las opciones
            if p_tipo_test:
                pregunta_test = PreguntaTest.objects.create_pregunta_test(pregunta=p_texto, idAsignatura=asignatura.id, titulo=p_titulo, id_pregunta=pregunta.id)

                try:
                    pregunta_test.save()
                except Exception as exception:
                    for i in imagenes_guardadas: 
                        fs.delete(i)                    
                    transaction.savepoint_rollback(sv_create_question)
                    content = {
                    "inserted": "false",
                    "message": "Error: " + exception.args[0],
                    }
                    return Response(content)

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
                    try:
                        imagenes_opc =  re.findall(r"!\[(.*?)\]\(([\w\/\-\:\._]+?)\)", p_opc)
                        if len(imagenes_opc) > 0:
                            comprobar_imagenes(imagenes_form, imagenes_opc)
                            for img in imagenes_form:
                                name = str(img)
                                if re.search(name,p_opc):
                                    store_name = fs.save(name, img)
                                    imagenes_guardadas.append(store_name)
                                    p_opc = p_opc.replace(name, store_name)
                        opcion = OpcionTest.objects.create_opciones_test(opcion=p_opc, idPregunta=pregunta.id, orden=index, fijar=p_fijar)
                        opcion.save()
                        if p_correcta:
                            pregunta_test.respuesta_id = opcion.id
                            pregunta_test.save()
                    except Exception as excep:
                        for i in imagenes_guardadas:
                            fs.delete(i)
                        transaction.savepoint_rollback(sv_create_question)
                        content = {
                        "inserted": "false",
                        "message": "Error:" + excep.args[0],
                        }
                        return Response(content)

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
    

    @action(methods=["POST"], detail=False)
    def imagen(self, request):
    
        imgs = request.FILES.getlist('files')
        fs = FileSystemStorage()
        photos = {}
        format = 'png'
        for img in imgs:
            name = str(img)
            store_name = fs.save(name, img)
            path = fs.path(store_name)
            with open(path, "rb") as image_file:
                encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
                photos[name] = 'data:image/%s;base64,%s' % (format, encoded_string)
        return Response(photos)

        # # encoded_string = ''
        # # encoded_string = base64.b64encode(img)
        # return Response(str(imgs))
