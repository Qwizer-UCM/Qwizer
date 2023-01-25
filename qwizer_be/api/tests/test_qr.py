from datetime import datetime
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from api.models import Asignatura, Cuestionario, Intento, User

# TODO usar faker y factory
# rutas -> https://www.django-rest-framework.org/api-guide/routers/#defaultrouter
class Qr(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(email="root@root.com", first_name="root", last_name="root", password="root", role="teacher")
        self.asignatura = Asignatura.objects.create_asignaturas(nombreAsignatura="ED", commit=True)
        self.cuestionario = Cuestionario.objects.create_cuestionarios(
            titulo="A",
            secuencial=1,
            idAsignatura=self.asignatura.id,
            idProfesor=self.user.id,
            duracion=10,
            password="a",
            fecha_cierre=datetime.fromisoformat("2025-12-01T00:00:00Z"),
            fecha_apertura=datetime.fromisoformat("2022-12-01T00:00:00Z"),
            fecha_visible=datetime.fromisoformat("2022-12-01T00:00:00Z"),
            commit=True,
        )
        self.client.force_authenticate(user=self.user)
        self.create_url = reverse("qr-list")

    def test_insert_qr(self):
        data = {"idUsuario": self.user.id, "idCuestionario": self.cuestionario.id, "hash": "XXXXXX"}
        response = self.client.post(self.create_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Intento.objects.count(), 1)
        self.assertEqual(Intento.objects.get_by_cuestionario_alumno(id_cuestionario=data["idCuestionario"], id_alumno=data["idUsuario"]).hash_offline, data["hash"])

    def test_insert_qr_after_sent(self):
        data = {"idUsuario": self.user.id, "idCuestionario": self.cuestionario.id, "hash": "XXXXXX"}
        Intento.objects.create_intento(idAlumno=data["idUsuario"], idCuestionario=data["idCuestionario"], hash="XX", commit=True)
        response = self.client.post(self.create_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Intento.objects.count(), 1)
        self.assertEqual(Intento.objects.get_by_cuestionario_alumno(id_cuestionario=data["idCuestionario"], id_alumno=data["idUsuario"]).hash_offline, data["hash"])