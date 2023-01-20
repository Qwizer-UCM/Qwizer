from api.models import Intento, User
from django.db import IntegrityError
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response


class QRViewSet(viewsets.ViewSet):
    permission_classes = []

    def create(self, request):
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
