from drf_spectacular.utils import OpenApiExample, OpenApiParameter, OpenApiResponse, extend_schema, extend_schema_view, inline_serializer
from api.models import Intento, User
from django.db import IntegrityError
from rest_framework import serializers, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from api.serializer import AlumnoSerializer


@extend_schema_view(
    create=extend_schema(
        summary="Insertar hash para un intento",
        responses={
            200: OpenApiResponse(
                response = inline_serializer(
                            name="qr200",
                            fields={"inserted": serializers.CharField(), "message": serializers.CharField()},
                            many=False,
                ),examples=[OpenApiExample(
                    "QR_INSERTED",
                    value={"inserted": True, "message": "¡El hash se ha insertado correctamente!"},
                    status_codes=[200],
                    response_only=True,
                )],
            ),
            400: OpenApiResponse(
                description='Error: Bad Request',
            ),
            403: inline_serializer(
                name="qr403",
                fields={"inserted": serializers.CharField(), "message": serializers.CharField()},
                many=False,
            ),
        },
        request=inline_serializer(
            name="insertarQR",
            fields={"idUsuario": serializers.IntegerField(), "idCuestionario": serializers.IntegerField(), "hash": serializers.CharField()},
            many=False,
        ),
    ),
    get=extend_schema(
        summary="Comprobación hash qr",
        parameters=[
            OpenApiParameter(name="id_usuario", type=int, location=OpenApiParameter.PATH),
            OpenApiParameter(name="id_cuestionario", type=int, location=OpenApiParameter.PATH),
        ],
        responses={
            200: inline_serializer(
                name="qr_listaAlumnoss",
                fields={"alumnos": AlumnoSerializer(many=True)},
                many=False,
            ),
        },
    ),
)
class QRViewSet(viewsets.ViewSet):
    permission_classes = []

    def create(self, request):
        if request.user.role == User.TEACHER:
            id_usuario = request.data["idUsuario"]
            id_cuestionario = request.data["idCuestionario"]
            req_hash = request.data["hash"]

            try:
                intento = Intento.objects.get_by_cuestionario_alumno(id_cuestionario=id_cuestionario, id_alumno=id_usuario)
                intento.hash_offline = req_hash
                intento.save(update_fields=["hash_offline"])  # TODO posible excepcion
                return Response({"inserted": True, "message": "¡El hash se ha insertado correctamente!"})
            except Intento.DoesNotExist:
                return Response(status=status.HTTP_400_BAD_REQUEST)

        else:
            return Response({"inserted": False, "message": "¡Un alumno no puede hacer esto!"},status.HTTP_403_FORBIDDEN)

    # TODO Alternativa https://github.com/alanjds/drf-nested-routers
    @action(methods=["get"], url_path=r"(?P<id_usuario>\d+)/(?P<id_cuestionario>\d+)", detail=False)
    def get(self, request, id_usuario, id_cuestionario):
        """
        GET /{idUsuario}/{idCuestionario}
        """
        if request.user.role == User.TEACHER:
            content = {}
            intento = Intento.objects.get_by_cuestionario_alumno(id_cuestionario=id_cuestionario, id_alumno=id_usuario)

            if intento.estado == Intento.Estado.ENTREGADO:
                content["corrected"] = intento.nota != 0  # TODO se puede sacar 0, cambiar
                content["hashSubida"] = intento.hash
                content["hashQr"] = intento.hash_offline
                content["qrSent"] = bool(intento.hash_offline)
            else:
                content["corrected"] = False
                content["qrSent"] = False
            return Response(content)
        else:
            return Response(data={"inserted": False, "message": "¡Un alumno no puede hacer esto!"}, status=status.HTTP_403_FORBIDDEN)
