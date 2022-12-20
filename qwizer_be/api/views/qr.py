from base64 import b64decode
import binascii
import json
from Crypto.Util.Padding import pad, unpad
from django.db import IntegrityError

from Crypto.Cipher import AES
from tomlkit import key
from api.models import Cuestionario, Intento, User
from django.core.exceptions import MultipleObjectsReturned, ObjectDoesNotExist
from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.utils.cifrado import decrypt, encrypt_tests


def copy_paste_test(respuestas,alumno,cuestionario):
    # for key,respuesta in respuestas.items():
    #     if respuesta["type"] == "test" and str(respuesta["answr"]).isdigit():
    #         opcion = OpcionTest.objects.get_by_id(id_opciones=respuesta["answr"])
    #         respuesta_enviada = RespuestaEnviadaTest.objects.create_respuesta(
    #             idCuestionario=cuestionario,
    #             idAlumno=alumno,
    #             idPregunta=respuesta["id"],
    #             idRespuesta=opcion,
    #         )
    #         respuesta_enviada.save()
    #     if respuesta["type"] == "text":
    #         respuesta_enviada = RespuestaEnviadaText.objects.create_respuesta(
    #             idCuestionario=cuestionario,
    #             idAlumno=alumno,
    #             idPregunta=respuesta["id"],
    #             Respuesta=respuesta["answr"],
    #         )
    #         respuesta_enviada.save()

    #     nota = nota + RespuestaEnviada.calcular_nota(respuesta,cuestionario)
    print("Insertadas respuestas")

class QRViewSet(viewsets.ViewSet):
    permission_classes = []

    def create(self, request):
        # TODO revisar porque hay que hacer dos veces el json.loads
        # dicts = {"data":True}
        # enc = encrypt_tests(json.dumps(dicts),"c")
        # test=decrypt(message=enc['encrypted_message'],in_iv=enc['iv'],in_key=enc['password'])
        # print(json.dumps({'data':True}).encode())
        # print(test.encode())
        # bug = json.loads(test)
        # print(type(bug))
        # bug = json.loads(bug)
        # print(type(bug))

        # a = decrypt(message=request.data["hash"],in_iv=request.data["iv"],in_key=request.data["key"])
        # print(type(json.loads(a)))

        # a = decrypt(message=request.data["idUsuario"],in_iv=request.data["idCuestionario"],in_key=request.data["hash"])
        # print(a)


        if request.user.role == User.TEACHER:
            id_usuario = request.data["idUsuario"]
            id_cuestionario = request.data["idCuestionario"]
            req_hash = request.data["hash"]
            intento = None
            try:
                intento = Intento.objects.get_by_cuestionario_alumno(id_cuestionario=id_cuestionario,id_alumno=id_usuario)
                intento.hash_offline=req_hash
                intento.save(update_fields=['hash_offline']) # TODO posible excepcion
            except Intento.DoesNotExist:
                try:
                    intento = Intento.objects.create_intento(idAlumno=id_usuario, idCuestionario=id_cuestionario, hash_offline=req_hash, commit=True)
                except IntegrityError:
                    return Response({"inserted":False,"message":"Error a la hora de insertar el hash."})
            else:
                respuestas = json.loads(b64decode(request.data['respuestas']).decode())
                copy_paste_test(respuestas,request.data['idUsuario'],request.data['idCuestionario'])
                return Response({"inserted":True,"message":"¡El hash se ha insertado correctamente!"})
        else:
            return Response({"inserted":False,"message":"¡Un alumno no puede hacer esto!"})

    # TODO Alternativa https://github.com/alanjds/drf-nested-routers
    # No se refleja en swagger
    @action(methods=["get"], url_path=r"(?P<id_usuario>\d+)/(?P<id_cuestionario>\d+)", detail=False)
    def get(self, request, id_usuario, id_cuestionario):
        """
        GET /{idUsuario}/{idCuestionario}
        """
        if request.user.role == User.TEACHER:
            content = {}
            try:
                intento = Intento.objects.get_by_cuestionario_alumno(id_cuestionario=id_cuestionario, id_alumno=id_usuario)
                content["corrected"] = intento.nota != 0
                content["hashSubida"] = intento.hash
                content["hashQr"] = intento.hash_offline
                content["qrSent"] = bool(intento.hash_offline)
            except Intento.DoesNotExist:
                content["corrected"] = False
                content["qrSent"] = False
            return Response(content)
        else:
            return Response(data={"inserted": False, "message": "¡Un alumno no puede hacer esto!"}, status=status.HTTP_403_FORBIDDEN)
