import yaml
from api.models import Asignatura, OpcionTest, Pregunta,PreguntaTest,PreguntaText,User
from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


class QuestionViewSet(viewsets.ViewSet):
    permission_classes = []

    def create(self, request):
        if str(request.user.role) == User.STUDENT:  # TODO controlar con permisos
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

        id_asignatura = request.data["idAsignatura"]

        try:
            asignatura = Asignatura.objects.get_by_id(id_asignatura=id_asignatura)
        except:
            content = {"inserted": "false", "message": f"Error: La asignatura {id_asignatura} no existe!"}
            return Response(content)

        preguntas = yamlplscomeon["preguntas"]

        for preg in preguntas:
            try:
                pregunta = Pregunta.objects.create_preguntas(
                    pregunta=preg["pregunta"],
                    idAsignatura=asignatura,
                    titulo=preg["titulo"],
                )
                pregunta.save()
            except:
                continue

            # Guardamos las opciones
            if preg["tipo"] == "test":
                opciones = preg["opciones"]
                for index ,opc in enumerate(opciones): #TODO comprobar si funciona no sabemos si opciones es un array                    
                    opcion = OpcionTest.objects.create_opciones_test(opcion=opc, idPregunta=pregunta)
                    try:
                        opcion.save()
                        if index == preg["op_correcta"]:
                            preguntaTest = PreguntaTest.objects.create_preguntasTest(idPregunta=pregunta,respuesta=opcion)
                            preguntaTest.save()
                    except:
                        print("La pregunta ya existia")

            elif preg["tipo"] == "text":
                preguntaText = PreguntaText.objects.create_preguntasText(respuesta=preg["opciones"], idPregunta=pregunta)
                preguntaText.save()

        content = {
            "inserted": "true",
            "message": "Las preguntas se han insertado correctamente",
        }
        return Response(content)

    def update(self, request, pk):
        if str(request.user.role) == User.STUDENT:
            content = {"message": "Error: Para actualizar una pregunta debes ser un profesor."}
            return Response(content)
        print(request.data["preguntaActualizada"])
        updated_question = request.data["preguntaActualizada"]

        pregunta = Pregunta.objects.get_by_id(id_pregunta=pk)  #TODO cambiar al servicio
        pregunta.titulo = updated_question["title"]
        pregunta.pregunta = updated_question["question"]
        pregunta.save(update_fields=['titulo','pregunta'])

        if updated_question["type"] == "test":
            for option in updated_question["options"]:
                option_obj = OpcionTest.objects.get_by_id(id_opciones=option["id"])
                option_obj.opcion = option["op"] # TODO añadir para que pueda añadir más respuestas
                option_obj.save(update_fields=['opcion'])

            pregunta_test =PreguntaTest.objects.get_by_id(id_pregunta=pk)
            pregunta_test.respuesta = OpcionTest.objects.get_by_id(id_opciones=updated_question["correct_op"])  
            pregunta_test.save(update_fields=['respuesta'])

        elif updated_question["type"] == "text":
            pregunta_text = PreguntaText.objects.get_by_id(id_pregunta=pk)
            pregunta_text.respuesta = updated_question["correct_op"]
            pregunta_text.save(update_fields=['respuesta'])

        content = {
            "message": "Pregunta actualizada correctamente",
        }
        return Response(content)

    def destroy(self, request, pk):
        if str(request.user.role) == User.STUDENT:
            content = {"message": "Error: Para eliminar una pregunta debes ser un profesor."}
            return Response(content)

        pregunta = Pregunta.objects.get_by_id(id_pregunta=pk)
        pregunta.delete() #TODO comprobar que pasa aqui con los hijos

        content = {
            "message": "Pregunta eliminada correctamente",
        }
        return Response(content)
