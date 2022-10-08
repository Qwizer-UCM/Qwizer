from rest_framework import serializers
from .utils.cifrado import encrypt_tests
from .models import Cuestionarios, OpcionesTest, Preguntas

#TODO mejor indicar los campos concretos en vez de __all__

class OpcionesTestSerializer(serializers.ModelSerializer):
    class Meta:
        model = OpcionesTest
        exclude = ["idPregunta"]

class PreguntasSerializer(serializers.ModelSerializer):
    opciones_test = OpcionesTestSerializer(many=True)

    class Meta:
        model = Preguntas
        fields = "__all__"  

class EncryptedTestsSerializer(serializers.ModelSerializer):
    preguntas = PreguntasSerializer(many=True)

    class Meta:
        model = Cuestionarios
        fields = "__all__"

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
