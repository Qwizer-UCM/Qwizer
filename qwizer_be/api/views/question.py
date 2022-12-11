import yaml
from api.models import Asignaturas, OpcionesTest, Preguntas, RespuestasTest, RespuestasTexto
from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


class QuestionViewSet(viewsets.ViewSet):
    permission_classes = []

    def create(self, request):
        if str(request.user.role) == "student":  # TODO controlar con permisos
            content = {
                "inserted": "false",
                "message": "Error: Para poder subir preguntas debes de ser administrador o profesor.",
            }
            return Response(content)

        try:
            yamlplscomeon = yaml.load(request.data["fichero_yaml"], Loader=yaml.FullLoader)
        except:
            content = {
                "inserted": "false",
                "message": "Error: El cuestionario está mal formado. Por favor, revisa que lo hayas escrito bien.",
            }
            return Response(content)

        nombre_asig = request.data["idAsignatura"]

        try:
            asignatura = Asignaturas.objects.get_by_id(id_asignatura=nombre_asig)
        except:
            content = {"inserted": "false", "message": f"Error: La asignatura {nombre_asig} no existe!"}
            return Response(content)

        preguntas = yamlplscomeon["preguntas"]

        for preg in preguntas:
            try:
                pregunta = Preguntas.objects.create_preguntas(
                    tipoPregunta=preg["tipo"],
                    pregunta=preg["pregunta"],
                    idAsignatura=asignatura,
                    titulo=preg["titulo"],
                )
                pregunta.save()
            except:
                pregunta = Preguntas.objects.get_by_asignatura_pregunta_tipo_titulo(
                    tipo=preg["tipo"], pregunta=preg["pregunta"], id_asignatura=asignatura.id,titulo=preg["titulo"]
                )
                continue

            # Guardamos las opciones
            if preg["tipo"] == "test":
                j = 0
                opciones = preg["opciones"]
                for opc in opciones:
                    opcion = OpcionesTest.objects.create_opciones_test(opcion=opc, idPregunta=pregunta)
                    try:
                        opcion.save()
                        if j == preg["op_correcta"]:
                            respuesta = RespuestasTest.objects.create_respuestas_test(idOpcion=opcion, idPregunta=pregunta)
                            respuesta.save()
                        j += 1
                    except:
                        print("La pregunta ya existia")
            elif preg["tipo"] == "text":
                respuesta_text = RespuestasTexto.objects.create_respuestas_texto(respuesta=preg["opciones"], idPregunta=pregunta)
                respuesta_text.save()

        content = {
            "inserted": "true",
            "message": "Las preguntas se han insertado correctamente",
        }
        return Response(content)

    def update(self, request, pk):
        if str(request.user.role) == "student":
            content = {"message": "Error: Para actualizar una pregunta debes ser un profesor."}
            return Response(content)
        print(request.data["preguntaActualizada"])
        updated_question = request.data["preguntaActualizada"]

        pregunta = Preguntas.objects.get_by_id(id_pregunta=pk)
        pregunta.titulo = updated_question["title"]
        pregunta.pregunta = updated_question["question"]
        pregunta.save()

        if updated_question["type"] == "test":
            for option in updated_question["options"]:
                option_obj = OpcionesTest.objects.get_by_id(id_opciones=option["id"])
                option_obj.opcion = option["op"]
                option_obj.save()

            resp_test = RespuestasTest.objects.get_by_pregunta(id_pregunta=pk)
            resp_test.idOpcion = OpcionesTest.objects.get_by_id(id_opciones=updated_question["correct_op"])
            resp_test.save()

        elif updated_question["type"] == "text":
            resp_text = RespuestasTexto.objects.get_by_pregunta(id_pregunta=pk)
            resp_text.respuesta = updated_question["correct_op"]
            resp_text.save()

        content = {
            "message": "Pregunta actualizada correctamente",
        }
        return Response(content)

    def destroy(self, request, pk):
        if str(request.user.role) == "student":
            content = {"message": "Error: Para eliminar una pregunta debes ser un profesor."}
            return Response(content)

        pregunta = Preguntas.objects.get_by_id(id_pregunta=pk)
        pregunta.delete()

        content = {
            "message": "Pregunta eliminada correctamente",
        }
        return Response(content)
