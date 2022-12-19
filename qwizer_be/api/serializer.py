from rest_framework import serializers
from .utils.cifrado import encrypt_tests
from .models import Cuestionario, OpcionTest, Pregunta, RespuestaEnviadaTest, RespuestaEnviadaText

#TODO mejor indicar los campos concretos en vez de __all__

class OpcionesTestSerializer(serializers.ModelSerializer):
    class Meta:
        model = OpcionTest
        exclude = ["idPregunta"]

class PreguntasSerializer(serializers.ModelSerializer):
    opciones_test = OpcionesTestSerializer(many=True)

    class Meta:
        model = Pregunta
        fields = "__all__"  

class EncryptedTestsSerializer(serializers.ModelSerializer):
    preguntas = PreguntasSerializer(many=True)

    class Meta:
        model = Cuestionario
        fields = "__all__"
    # TODO representacion no cuadra con front, DTO en React?
    # TODO Salen un poco desordenadas las keys, (por orden de inserción)
    def to_representation(self, instance):
        res = super().to_representation(instance)
        encrypted = encrypt_tests(res["preguntas"], instance.password)
        res["iv"] = encrypted["iv"]
        res["password"] = encrypted["password"]
        res["encrypted_message"] = encrypted["encrypted_message"]
        #TODO si solo se usa en front la fecha formateada se puede evitar pasar las dos
        res["formatted_fecha_apertura"] = instance.fecha_apertura.strftime(
            "%d/%m/%Y, %H:%M:%S"
        )
        res["formatted_fecha_cierre"] = instance.fecha_cierre.strftime(
            "%d/%m/%Y, %H:%M:%S"
        )
        res.pop("preguntas")
        return res


class RespuestasEnviadasTestSerializer(serializers.ModelSerializer):
    class Meta:
        model = RespuestaEnviadaTest
        fields = "__all__"
class RespuestasEnviadasTextSerializer(serializers.ModelSerializer):
    class Meta:
        model = RespuestaEnviadaText
        fields = "__all__"

class RespuestasSerializer(serializers.Serializer):
    def to_internal_value(self, data):
        data["idAlumno"] = self.context["user"].id
        data["idCuestionario"] = self.context["idCuestionario"]
        data["idPregunta"] = data.pop("id")

        test_type = data.pop("type")
        print(test_type)
        if test_type == "test":
            data["idRespuesta"] = data.pop("answr")
            return RespuestasEnviadasTestSerializer().to_internal_value(data)
        elif test_type == "text":
            data["Respuesta"] = data.pop("answr")
            return RespuestasEnviadasTextSerializer().to_internal_value(data)

    def to_representation(self, instance):
        return instance