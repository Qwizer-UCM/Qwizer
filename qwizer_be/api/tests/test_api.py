from datetime import datetime
import io
import os
import sys
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
import yaml
from yaml import loader

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


class Cosa(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(email="test@root.com", first_name="root", last_name="root", password="root", role="teacher")
        self.client.force_authenticate(user=self.user)
        self.send_url = reverse("test-subir")

    def test_enviar(self):
        preguntas = [
            {
                "tipo": "text",
                "pregunta": "¿Con qué TADs se puede implementar un diccionario?",
                "titulo": "Titulo 1",
                "opciones": "Con un árbol de búsqueda o una tabla dispersa",
                "punt_positiva": 3,
                "punt_negativa": 0.3,
            },
            {
                "tipo": "test",
                "pregunta": "El problema de la mochila usa el esquema de :",
                "titulo": "Titulo 3",
                "opciones": ["Divide y Vencerás", "Vuelta atrás"],
                "op_correcta": 1,
                "punt_positiva": 1.0,
                "punt_negativa": 0.3,
            },
            {
                "tipo": "test",
                "pregunta": "Indica qué TAD no es lineal:",
                "titulo": "Titulo 2",
                "opciones": ["Cola", "Pila", "Árbol", "Lista"],
                "op_correcta": 2,
                "punt_positiva": 1.0,
                "punt_negativa": 0.3,
            },
            {
                "tipo": "test",
                "pregunta": "El problema de las n-reinas usa el esquema de :",
                "titulo": "Titulo 4",
                "opciones": ["Vuelta atrás", "Divide y Vencerás"],
                "op_correcta": 0,
                "punt_positiva": 0.5,
                "punt_negativa": 0.3,
            },
            {
                "tipo": "test",
                "pregunta": "El TAD Cola se puede implementar con un array estático circular",
                "titulo": "Titulo 5",
                "opciones": ["Verdadero", "Falso"],
                "op_correcta": 0,
                "punt_positiva": 0.5,
                "punt_negativa": 0.3,
            },
        ]
        dict_yaml = {
            "cuestionario": {
                "titulo": "Tema 8",
                "password": "1234",
                "asignatura": "Estructura de datos",
                "secuencial": 0,
                "duracion": 10,
                "fecha_apertura": "21/02/20 11:00:00",
                "fecha_cierre": "23/02/23 11:59:59",
            }
        }
        dict_yaml['preguntas'] = preguntas
        # with open(os.path.join(os.path.dirname(__file__), "examples/test1.yml"), "rb") as file:
        #     response = self.client.post(self.send_url, {"fichero_yaml": file}, format="multipart")
        buf = io.BytesIO()
        data = yaml.dump(data=dict_yaml)
        buf.write(data.encode())
        
        response = self.client.post(self.send_url, {"fichero_yaml": buf.getvalue()}, format="multipart")
        #self.assertEqual(response.status_code,status.HTTP_200_OK)
        
