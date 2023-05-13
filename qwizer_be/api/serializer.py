import re
import base64
from rest_framework import serializers
from django.core.files.storage import FileSystemStorage
from .utils.cifrado import encrypt_tests
from .models import Cuestionario, InstanciaOpcionTest, InstanciaPregunta, OpcionTest, Pregunta, SeleccionPregunta,PreguntaTest,PreguntaText, InstanciaPreguntaTest, InstanciaPreguntaText

#TODO mejor indicar los campos concretos en vez de __all__

class OpcionesTestSerializer(serializers.ModelSerializer):
    opcion = serializers.SerializerMethodField(method_name="get_opcion")

    def get_opcion(self,obj):
        fs = FileSystemStorage()
        opcion = obj.opcion
        imagenes_devolver = re.findall(r"!\[(.*?)\]\(([\w\/\-\:\._]+?)\)", obj.opcion)
        for img in imagenes_devolver:
            name = str(img[1])
            format = name.split(".")[1]
            if format == "svg":
                format +="+xml"
            path = fs.path(name)
            with open(path, "rb") as image_file:
                encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
                imagen_base64 = 'data:image/%s;base64,%s' % (format, encoded_string)
                opcion = opcion.replace(name, imagen_base64)
        return opcion


    class Meta:
        model = OpcionTest
        fields = "__all__"

class SeleccionPreguntaSerializer(serializers.ModelSerializer):
    class Meta:
        model = SeleccionPregunta
        fields = "__all__"

class PreguntasSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pregunta
        fields = "__all__"
    


    def to_representation(self, instance):
        preg = None
        if hasattr(instance, "preguntatest"):
            preg = PreguntasTestSerializer(instance=instance.preguntatest).data
        if hasattr(instance, "preguntatext"):
            preg = PreguntasTextSerializer(instance=instance.preguntatext).data
        return preg

class PreguntasTestSerializer(serializers.ModelSerializer):
    opciones_test = OpcionesTestSerializer(many=True)
    tipoPregunta = serializers.CharField(default="test")
    pregunta = serializers.SerializerMethodField(method_name="get_pregunta")
        
    def get_pregunta(self,obj):
        fs = FileSystemStorage()
        pregunta_enunciado = obj.pregunta
        imagenes_devolver = re.findall(r"!\[(.*?)\]\(([\w\/\-\:\._]+?)\)", obj.pregunta)
        for img in imagenes_devolver:
            name = str(img[1])
            format = name.split(".")[1]
            if format == "svg":
                format +="+xml"
            path = fs.path(name)
            with open(path, "rb") as image_file:
                encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
                imagen_base64 = 'data:image/%s;base64,%s' % (format, encoded_string)
                pregunta_enunciado = pregunta_enunciado.replace(name, imagen_base64)
               
        return pregunta_enunciado

    class Meta:
        model = PreguntaTest
        fields = "__all__"

class PreguntasTextSerializer(serializers.ModelSerializer):
    tipoPregunta = serializers.CharField(default="text")
    pregunta = serializers.SerializerMethodField(method_name="get_pregunta")
        
    def get_pregunta(self,obj):
        fs = FileSystemStorage()
        pregunta_enunciado = obj.pregunta
        imagenes_devolver = re.findall(r"!\[(.*?)\]\(([\w\/\-\:\._]+?)\)", obj.pregunta)
        for img in imagenes_devolver:
            name = str(img[1])
            format = name.split(".")[1]
            if format == "svg":
                format +="+xml"            
            path = fs.path(name)
            with fs.open(path, "rb") as image_file:
                encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
                imagen_base64 = 'data:image/%s;base64,%s' % (format, encoded_string)
                pregunta_enunciado = pregunta_enunciado.replace(name, imagen_base64)
               
        return pregunta_enunciado

    class Meta:
        model = PreguntaText
        fields = "__all__"


class InstanciaOpcionSerializer(serializers.ModelSerializer):
    class Meta:
        model = InstanciaOpcionTest
        fields = "__all__"

class InstanciaPreguntaSerializer(serializers.ModelSerializer):

    class Meta:
        model = InstanciaPregunta
        fields = "__all__"

    def to_representation(self, instance):
        pregunta = None
        if hasattr(instance, "instanciapreguntatest"):
            pregunta = InstanciaPreguntaTestSerializer(instance=instance.instanciapreguntatest).data
        if hasattr(instance, "instanciapreguntatext"):
            pregunta = InstanciaPreguntaTextSerializer(instance=instance.instanciapreguntatext).data
        return pregunta

class InstanciaPreguntaTestSerializer(serializers.ModelSerializer):
    class Meta:
        model = InstanciaPreguntaTest
        fields = "__all__"

class InstanciaPreguntaTextSerializer(serializers.ModelSerializer):
    class Meta:
        model = InstanciaPreguntaText
        fields = "__all__"

class CuestionarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cuestionario
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
#        res.pop("preguntas")
        return res


class RespuestasEnviadasTestSerializer(serializers.ModelSerializer):
    class Meta:
        model = InstanciaPreguntaTest
        fields = "__all__"
class RespuestasEnviadasTextSerializer(serializers.ModelSerializer):
    class Meta:
        model = InstanciaPreguntaText
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
    

class AlumnoSerializer(serializers.Serializer):
    id = serializers.CharField()
    nombre = serializers.CharField()
    apellidos = serializers.CharField()