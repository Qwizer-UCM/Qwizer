from api.models import Cuestionarios, EnvioOffline, Notas, User
from django.core.exceptions import MultipleObjectsReturned, ObjectDoesNotExist
from rest_framework import viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


class QRViewSet(viewsets.ViewSet):
    permission_classes = []

    def create(self, request):
        content = {}
        if request.user.role == "teacher":
            try:
                id_usuario = request.data["idUsuario"]
                alumno = User.objects.get_by_id(id_usuario=id_usuario)
                id_cuestionario = request.data["idCuestionario"]
                cuestionario = Cuestionarios.objects.get_by_id(id_cuestionario=id_cuestionario)
                req_hash = request.data["hash"]
                objeto_insercion_manual = EnvioOffline.objects.create_envio_offline(idAlumno=alumno, idCuestionario=cuestionario, hash=req_hash)
            except (ObjectDoesNotExist, MultipleObjectsReturned):
                message = "El codigo QR esta mal formado"
                inserted = False
                content["inserted"] = inserted
                content["message"] = message
                return Response(content)
            try:
                objeto_insercion_manual.save()
            except Exception:
                message = "Error a la hora de insertar el hash en la base de datos. Es probable que ya se haya insertado antes."
                inserted = False
                content["inserted"] = inserted
                content["message"] = message
                return Response(content)
            message = "¡El hash se ha insertado correctamente!"
            inserted = True
            content["inserted"] = inserted
            content["message"] = message
            return Response(content)
        else:
            message = "¡Un alumno no puede hacer esto!"
            inserted = False
            content["inserted"] = inserted
            content["message"] = message
            return Response(content)

    # TODO Alternativa https://github.com/alanjds/drf-nested-routers
    # No se refleja en swagger
    @action(methods=["get"], url_path=r"(?P<id_usuario>\d+)/(?P<id_cuestionario>\d+)", detail=False)
    def get(self, request, id_usuario, id_cuestionario):
        """
        GET idUsuario/idCuestionario
        """
        content = {}
        if request.user.role == "teacher":
            try:
                hash1 = Notas.objects.get_by_cuestionario_alumno(id_cuestionario=id_cuestionario,id_alumno=id_usuario)
                content["corrected"] = True
                content["hashSubida"] = hash1.hash
            except:
                content["corrected"] = False
            try:
                hash2 = EnvioOffline.objects.get_by_cuestionario_alumno(id_cuestionario=id_cuestionario,id_alumno=id_usuario)
                content["hashQr"] = hash2.hash
                print(hash2.hash)
                content["qrSent"] = True
            except:
                content["qrSent"] = False
            return Response(content)
        else:
            message = "¡Un alumno no puede hacer esto!"
            inserted = False
            content["inserted"] = inserted
            content["message"] = message
            return Response(content)
