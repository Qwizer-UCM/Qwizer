from rest_framework import status
from rest_framework.test import APITestCase
from django.urls import reverse
import yaml
from api.models import Asignatura,Cuestionario,Pregunta,PreguntaText, User

class Subject(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(email="test@root.com", first_name="root", last_name="root", password="root", role="teacher")
        self.client.force_authenticate(user=self.user)
        self.asig = Asignatura.objects.create_asignaturas(nombreAsignatura="Test", commit=True)

    def test_subject_list(self):

        url_subject_list = reverse("subject-list")
        response = self.client.get(url_subject_list)

        data = response.data

        self.assertEqual(len(data["asignaturas"]), Asignatura.objects.all().count())  

    def test_subject_cuestionarios(self):
        asig = Asignatura.objects.create_asignaturas(nombreAsignatura="Test", commit=True)
        
        Cuestionario.objects.create_cuestionarios(titulo="Titulo", secuencial=0,idProfesor=self.user.id, password="a",duracion=10, fecha_cierre="2022-11-08 22:33:00.000 +0100", fecha_apertura="2022-11-09 22:33:00.000 +0100", fecha_visible="2022-11-08 22:33:00.000 +0100", idAsignatura=self.asig.id, commit=True)

        url_cuestionarios = reverse("subject-cuestionarios", args=[self.asig.id])
        response = self.client.get(url_cuestionarios)

        data = response.data

        self.assertEqual(len(data["cuestionarios"]), Cuestionario.objects.get_by_asignatura(id_asignatura=self.asig.id).count())  # TODO se puede hacer un test llamando a una funcion quew utilize ese metodo
        
    def test_subject_preguntas(self):
        test_pregunta = Pregunta.objects.create_preguntas(pregunta="PreguntaPrueba",idAsignatura=self.asig.id, titulo="TituloPrueba", commit=True)

        PreguntaText.objects.create_pregunta_text(pregunta="PreguntaPrueba",idAsignatura=self.asig.id, titulo="TituloPrueba",respuesta="Respuesta correcta",id_pregunta=test_pregunta.id, commit=True)

        url_preguntas = reverse("subject-preguntas", args=[self.asig.id])
        response = self.client.get(url_preguntas)

        data = response.data

        self.assertEqual(len(data["preguntas"]), Pregunta.objects.get_by_asignatura(id_asignatura=self.asig.id).count())
        
