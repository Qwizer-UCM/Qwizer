from datetime import datetime
import json
from pprint import pprint
from rest_framework import status
from rest_framework.test import APITestCase
from django.urls import reverse
import yaml
from api.models import Asignatura, Cuestionario, Intento, Pregunta, PreguntaCuestionario, User
from api.utils.cifrado import decrypt
from django.utils.timezone import make_aware


class Test(APITestCase):
    def setUp(self):
        self.asignatura = Asignatura.objects.create_asignaturas(nombreAsignatura="ED", commit=True)
        self.user = User.objects.create_user(email="test@root.com", first_name="root", last_name="root", password="root", role="teacher")
        self.client.force_authenticate(user=self.user)
        self.yaml_test = {
            "cuestionario": {
                "titulo": "Tema 8",
                "password": "1234",
                "asignatura": self.asignatura.nombreAsignatura,
                "secuencial": 0,
                "duracion": 10,
                "fecha_apertura": "21/02/20 11:00:00",
                "fecha_cierre": "23/02/23 11:59:59",
                "fecha_visible": "21/02/20 11:00:00",
                "aleatorizar": True,
                "preguntas": [
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
                        "opciones": [{"op": "Divide y Vencerás", "fijar": False}, {"op": "Vuelta atrás", "fijar": False}],
                        "op_correcta": 1,
                        "punt_positiva": 1.0,
                        "punt_negativa": 0.3,
                        "aleatorizar": True,
                    },
                    {
                        "tipo": "test",
                        "pregunta": "Indica qué TAD no es lineal:",
                        "titulo": "Titulo 2",
                        "opciones": [{"op": "Cola", "fijar": False}, {"op": "Pila", "fijar": False}, {"op": "Árbol", "fijar": False}, {"op": "Lista", "fijar": False}],
                        "op_correcta": 2,
                        "punt_positiva": 1.0,
                        "punt_negativa": 0.3,
                        "aleatorizar": True,
                    },
                    {
                        "tipo": "test",
                        "pregunta": "El problema de las n-reinas usa el esquema de :",
                        "titulo": "Titulo 4",
                        "opciones": [{"op": "Vuelta atrás", "fijar": False}, {"op": "Divide y Vencerás", "fijar": False}],
                        "op_correcta": 0,
                        "punt_positiva": 0.5,
                        "punt_negativa": 0.3,
                    },
                    {
                        "tipo": "test",
                        "pregunta": "El TAD Cola se puede implementar con un array estático circular",
                        "titulo": "Titulo 5",
                        "opciones": [{"op": "Verdadero", "fijar": False}, {"op": "Falso", "fijar": False}],
                        "op_correcta": 0,
                        "punt_positiva": 0.5,
                        "punt_negativa": 0.3,
                    },
                ],
            }
        }

    def test_retrieve_aleatorizar(self):
        # Aleatorizacion complicada de probar, simplemente se prueba si devuelve siempre el mismo orden.
        dict_yaml = self.yaml_test
        preg = dict_yaml["cuestionario"]["preguntas"][0]
        for i in range(100):
            dict_yaml["cuestionario"]["preguntas"].append({**preg, "titulo": f'{i}.{preg["titulo"]}'})
        data = yaml.safe_dump(data=dict_yaml)
        url_subir = reverse("test-subir")

        response_subir = self.client.post(url_subir, {"fichero_yaml": data})  # TODO deberia devolver el id
        url = reverse("test-detail", args=[Cuestionario.objects.all()[0].id])
        response = self.client.get(url)
        response2 = self.client.get(url)

        data1, data2 = response.data, response2.data
        data1["encrypted_message"] = decrypt(data1["encrypted_message"], data1["iv"], data1["password"])
        data2["encrypted_message"] = decrypt(data2["encrypted_message"], data2["iv"], data2["password"])
        data1.pop("iv")
        data2.pop("iv")

        self.assertEqual(response_subir.status_code, status.HTTP_200_OK)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response2.status_code, status.HTTP_200_OK)
        self.assertDictEqual(data1, data2)

    def test_create(self):
        pregunta = Pregunta.objects.create_preguntas(pregunta="¿ELP es divertida?", idAsignatura=self.asignatura.id, titulo="ELP", commit=True)
        cuestionario = {
            "testName": "test",
            "testPass": "test",
            "testSubject": self.asignatura.id,
            "secuencial": 0,
            "testDuration": 1000,
            "fechaApertura": 1671490800,
            "fechaCierre": 1703026800,
            "fechaVisible": 1671490800,
            "questionList": [{"id": pregunta.id, "punt_positiva": 0, "punt_negativa": 0}],
        }
        url = reverse("test-list")

        response = self.client.post(url, {"cuestionario": cuestionario}, format="json")
        created = Cuestionario.objects.all()[0]  # TODO creacion de cuestionarios deberia devolver id e incluso el propio objeto
        count_preguntas = created.preguntas.all().count()

        self.assertEqual(status.HTTP_200_OK, response.status_code)  # TODO Deberia ser 201
        self.assertEqual(response.data["inserted"], "true")
        self.assertEqual(count_preguntas, len(cuestionario["questionList"]))  # TODO complicado de comprobar si se han insertado bien
        self.assertEqual(created.titulo, cuestionario["testName"])  # TODO serializadores para comprobar si son iguales?
        self.assertEqual(created.password, cuestionario["testPass"])
        self.assertEqual(created.asignatura_id, cuestionario["testSubject"])
        self.assertEqual(created.secuencial, cuestionario["secuencial"])
        self.assertEqual(created.duracion, cuestionario["testDuration"])
        self.assertEqual(created.fecha_apertura.timestamp() * 1000, cuestionario["fechaApertura"])
        self.assertEqual(created.fecha_cierre.timestamp() * 1000, cuestionario["fechaCierre"])
        self.assertEqual(created.fecha_visible.timestamp() * 1000, cuestionario["fechaVisible"])
        self.assertIn("inserted", response.data)

    def test_enviar_sin_intento(self):
        time_format = "%Y-%m-%d"
        cuestionario = Cuestionario.objects.create_cuestionarios(
            titulo="ED",
            secuencial=0,
            idAsignatura=self.asignatura.id,
            idProfesor=self.user.id,
            duracion=100,
            password="X",
            fecha_cierre=make_aware(datetime.strptime("2023-12-20", time_format)),
            fecha_apertura=make_aware(datetime.strptime("2022-12-20", time_format)),
            fecha_visible=make_aware(datetime.strptime("2022-12-20", time_format)),
            commit=True,
        )
        url = reverse("test-enviar", args=[cuestionario.id])
        payload = {"hash": 0, "respuestas": [{"id": 0, "type": "test", "answr": 2}, {"id": 1, "type": "text", "answr": "Respuesta"}]}

        response = self.client.post(url, payload)

        self.assertEqual(status.HTTP_400_BAD_REQUEST, response.status_code)

    def test_info(self):
        time_format = "%Y-%m-%d"
        cuestionario = Cuestionario.objects.create_cuestionarios(
            titulo="ED",
            secuencial=0,
            idAsignatura=self.asignatura.id,
            idProfesor=self.user.id,
            duracion=100,
            password="X",
            fecha_cierre=make_aware(datetime.strptime("2023-12-20", time_format)),
            fecha_apertura=make_aware(datetime.strptime("2022-12-20", time_format)),
            fecha_visible=make_aware(datetime.strptime("2022-12-20", time_format)),
            commit=True,
        )
        url = reverse("test-info", args=[cuestionario.id])
        response = self.client.get(url)

        self.assertEqual(status.HTTP_200_OK, response.status_code)
        self.assertEqual(cuestionario.duracion, response.data["duracion"])
        self.assertEqual(cuestionario.fecha_apertura, response.data["fecha_apertura"])
        self.assertEqual(cuestionario.fecha_cierre, response.data["fecha_cierre"])
        self.assertEqual(cuestionario.fecha_visible, response.data["fecha_visible"])
        self.assertIn("formatted_fecha_apertura", response.data)
        self.assertIn("formatted_fecha_cierre", response.data)
        self.assertIn("formatted_fecha_visible", response.data)
        self.assertIn("corregido", response.data)
        self.assertIn("nota", response.data)

    # TODO tests
    def test_nota(self):
        time_format = "%Y-%m-%d"
        cuestionario = Cuestionario.objects.create_cuestionarios(
            titulo="ED",
            secuencial=0,
            idAsignatura=self.asignatura.id,
            idProfesor=self.user.id,
            duracion=100,
            password="X",
            fecha_cierre=make_aware(datetime.strptime("2023-12-20", time_format)),
            fecha_apertura=make_aware(datetime.strptime("2022-12-20", time_format)),
            fecha_visible=make_aware(datetime.strptime("2022-12-20", time_format)),
            commit=True,
        )
        url = reverse("test-nota",args=[cuestionario.id,self.user.id])

        response = self.client.get(url)
        # questions_count = PreguntaCuestionario.objects.get_by_cuestionario(id_cuestionario=cuestionario.id).count()

        self.assertEqual(status.HTTP_400_BAD_REQUEST, response.status_code)
        # self.assertEqual(cuestionario.titulo, response.data["titulo"])
        # self.assertEqual(questions_count, len(response.data["questions"]))
        # self.assertIn("nota", response.data)

    def test_notas(self):
        time_format = "%Y-%m-%d"
        cuestionario = Cuestionario.objects.create_cuestionarios(
            titulo="ED",
            secuencial=0,
            idAsignatura=self.asignatura.id,
            idProfesor=self.user.id,
            duracion=100,
            password="X",
            fecha_cierre=make_aware(datetime.strptime("2023-12-20", time_format)),
            fecha_apertura=make_aware(datetime.strptime("2022-12-20", time_format)),
            fecha_visible=make_aware(datetime.strptime("2022-12-20", time_format)),
            commit=True,
        )
        url = reverse("test-notas", args=[cuestionario.id])

        response = self.client.get(url)

        self.assertEqual(status.HTTP_200_OK, response.status_code)

    def test_subir(self):
        url = reverse("test-subir")
        dict_yaml = self.yaml_test
        data = yaml.safe_dump(data=dict_yaml)

        response = self.client.post(url, {"fichero_yaml": data})

        self.assertEqual(status.HTTP_200_OK, response.status_code)
        self.assertEqual("true", response.data["inserted"])
