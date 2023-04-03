from rest_framework import status
from rest_framework.test import APITestCase
from django.urls import reverse
import yaml
from api.models import Asignatura,PreguntaTest,PreguntaText, Pregunta, User

class Question(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(email="test@root.com", first_name="root", last_name="root", password="root", role="teacher")
        self.client.force_authenticate(user=self.user)
        self.asignatura = Asignatura.objects.create_asignaturas(nombreAsignatura="Test", commit=True)

    def test_upload_question(self):
        dict_yaml = {
            "preguntas": [
                    {
                        "tipo": "text",
                        "pregunta": "Enumera al menos 2 animales mamiferos",
                        "titulo": "Titulo 1",
                        "opciones": "Pajaro Gallina",
                    },
                    {
                        "tipo": "test",
                        "pregunta": "Madrid es la capital de...",
                        "titulo": "Titulo 3",
                        "opciones": [{"op": "España", "fijar": False}, {"op": "Argentina", "fijar": False},{"op": "Oceano Pacifico", "fijar": False},{"op": "Ninguna de las anteriores", "fijar": True}],
                        "op_correcta": 0
                    }
                ] 
            }
        data = yaml.safe_dump(data=dict_yaml)
        url_upload = reverse("question-list")
        response_upload = self.client.post(url_upload, {"fichero_yaml": data, "idAsignatura": self.asignatura.id})
        url_preguntas = reverse("subject-preguntas", args=[self.asignatura.id]) # Dirección donde obtener las preguntas creadas
        response = self.client.get(url_preguntas)

        self.assertEqual(response_upload.status_code, status.HTTP_200_OK)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_update_question(self):
        test_pregunta = Pregunta.objects.create_preguntas(pregunta="PreguntaPrueba",idAsignatura=self.asignatura.id, titulo="TituloPrueba", commit=True)

        #Primero testeamos la actualización de la pregunta text
        test_pregunta_text = PreguntaText.objects.create_pregunta_text(pregunta="PreguntaPrueba",idAsignatura=self.asignatura.id, titulo="TituloPrueba",respuesta="Respuesta correcta",id_pregunta=test_pregunta.id, commit=True)

        new_data = {
            "type": "text",
            "title": "Nuevo Titulo",
            "question": "Nuevo enunciado",
            "correct_op": "Nueva solucion"
        }

        url_update = reverse("question-detail", args=[test_pregunta.id])
        self.client.put(url_update, {"preguntaActualizada": new_data}, format="json")
        preguntaActualizada = PreguntaText.objects.get_by_id(id_pregunta=test_pregunta_text.id)

        # TODO otra vez el naming jodiendo
        self.assertEqual(preguntaActualizada.titulo, new_data["title"])
        self.assertEqual(preguntaActualizada.pregunta, new_data["question"])
        self.assertEqual(preguntaActualizada.respuesta, new_data["correct_op"])

        
    
    
    def test_delete_question(self):
        test_pregunta = Pregunta.objects.create_preguntas(pregunta="PreguntaPrueba",idAsignatura=self.asignatura.id, titulo="TituloPrueba", commit=True)
        
        PreguntaTest.objects.create_pregunta_test(pregunta="PreguntaTestPrueba",idAsignatura=self.asignatura.id, titulo="TituloPrueba", id_pregunta=test_pregunta.id, commit=True)

        url_borrar = reverse("question-detail", args=[test_pregunta.id])

        preguntaGuardada = Pregunta.objects.all()
        preguntaTestGuardada = PreguntaTest.objects.all()

        self.assertEqual(preguntaGuardada.count(),1)
        self.assertEqual(preguntaTestGuardada.count(),1)

        preguntaBorrada = Pregunta.objects.all()
        preguntaTestBorrada = PreguntaTest.objects.all()

        self.client.delete(url_borrar)

        self.assertEqual(preguntaBorrada.count(),0)
        self.assertEqual(preguntaTestBorrada.count(),0)






        




        
