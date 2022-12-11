from django.db import models
from django.db.models.signals import post_save
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from django.dispatch import receiver
from rest_framework.authtoken.models import Token

from api.manager import (
    AsignaturasManager,
    CuestionariosManager,
    EnvioOfflineManager,
    EsAlumnoManager,
    ImparteManager,
    NotasManager,
    OpcionesTestManager,
    PerteneceACuestionarioManager,
    PreguntasManager,
    RespuestasEnviadasManager,
    RespuestasEnviadasTestManager,
    RespuestasEnviadasTextManager,
    RespuestasTestManager,
    RespuestasTextoManager,
    UserManager,
)


class User(AbstractBaseUser, PermissionsMixin):
    objects = UserManager()
    email = models.EmailField(verbose_name=_("email address"), max_length=255, unique=True)
    # password field supplied by AbstractBaseUser
    # last_login field supplied by AbstractBaseUser
    first_name = models.CharField(_("first name"), max_length=30, blank=True)
    last_name = models.CharField(_("last name"), max_length=150, blank=True)

    # Añadir campo rol del usuario
    userRole = models.TextChoices("userRole", "student teacher admin")
    role = models.CharField(_("role"), choices=userRole.choices, max_length=7, blank=False)

    is_active = models.BooleanField(
        _("active"),
        default=True,
        help_text=_("Designates whether this user should be treated as active. " "Unselect this instead of deleting accounts."),
    )
    is_staff = models.BooleanField(
        _("staff status"),
        default=False,
        help_text=_("Designates whether the user can log into this admin site."),
    )
    # is_superuser field provided by PermissionsMixin
    # groups field provided by PermissionsMixin
    # user_permissions field provided by PermissionsMixin

    date_joined = models.DateTimeField(_("date joined"), default=timezone.now)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name", "role"]

    def get_full_name(self):
        """
        Return the first_name plus the last_name, with a space in between.
        """
        full_name = "%s %s" % (self.first_name, self.last_name)
        return full_name.strip()

    def __str__(self):
        return "{} <{}>".format(self.get_full_name(), self.email)

    def has_perm(self, perm, obj=None):
        "Does the user have a specific permission?"
        # Simplest possible answer: Yes, always
        return True

    def has_module_perms(self, app_label):
        "Does the user have permissions to view the app `app_label`?"
        # Simplest possible answer: Yes, always
        return True


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    if created:
        Token.objects.create(user=instance)

class OpcionesTest(models.Model):
    objects = OpcionesTestManager()
    idPregunta = models.ForeignKey("Preguntas", related_name="opciones_test", on_delete=models.CASCADE)
    opcion = models.CharField(blank=True, max_length=254, verbose_name="opcion")

    # TODO no estoy seguro de que sea lo ideal pero nos permite refactorizar con facilidad
    # https://docs.djangoproject.com/en/4.1/ref/models/instances/

    def __str__(self):
        return self.opcion

    class Meta:
        db_table = "opciones_test"


class Preguntas(models.Model):
    objects = PreguntasManager()
    tipoPregunta = models.CharField(blank=True, max_length=100, verbose_name="tipoPregunta")
    pregunta = models.CharField(blank=True, max_length=254, verbose_name="pregunta")
    idAsignatura = models.ForeignKey("Asignaturas", on_delete=models.CASCADE)
    titulo = models.CharField(blank=True, max_length=254, verbose_name="titulo")

    def __str__(self):
        return self.pregunta

    class Meta:
        ordering = ["pregunta"]
        db_table = "preguntas"
        unique_together = [
            "pregunta",
            "tipoPregunta",
            "idAsignatura",
        ]  # No pueden haber preguntas iguales para una asignatura


class Cuestionarios(models.Model):
    objects = CuestionariosManager()
    titulo = models.CharField(blank=True, max_length=100, verbose_name="titulo")
    idProfesor = models.ForeignKey(User, on_delete=models.CASCADE)
    idAsignatura = models.ForeignKey("Asignaturas", on_delete=models.CASCADE)
    duracion = models.IntegerField(default=10, verbose_name="duracion")
    secuencial = models.IntegerField(default=1, verbose_name="secuencial")  # 0 no es secuencial, 1 es secuencial
    password = models.CharField(blank=True, max_length=300, verbose_name="password")
    fecha_apertura = models.DateTimeField(blank=False, verbose_name="fecha_apertura")
    fecha_cierre = models.DateTimeField(blank=False, verbose_name="fecha_cierre")
    preguntas = models.ManyToManyField(Preguntas, through="PerteneceACuestionario")

    def __str__(self):
        return self.titulo

    class Meta:
        ordering = ["titulo"]
        db_table = "cuestionarios"
        unique_together = (
            "idAsignatura",
            "titulo",
        )  # No puede haber dos cuestionarios con el mismo nombre para una asignatura


class PerteneceACuestionario(models.Model):
    objects = PerteneceACuestionarioManager()
    idPregunta = models.ForeignKey("Preguntas", related_name="preguntas", on_delete=models.CASCADE)
    idCuestionario = models.ForeignKey("Cuestionarios", on_delete=models.CASCADE)
    nQuestion = models.IntegerField(verbose_name="nPregunta")
    puntosAcierto = models.DecimalField(default=0, max_digits=30, decimal_places=2, verbose_name="puntosAcierto")
    puntosFallo = models.DecimalField(default=0, max_digits=30, decimal_places=2, verbose_name="puntosFallo")

    def __str__(self):
        return str(self.idPregunta) + "/" + str(self.idCuestionario)

    class Meta:
        ordering = ["idPregunta"]
        db_table = "pertenece_cuestionario"


class RespuestasTexto(models.Model):
    objects = RespuestasTextoManager()
    idPregunta = models.ForeignKey("Preguntas", on_delete=models.CASCADE)
    respuesta = models.CharField(blank=True, max_length=254, verbose_name="respuesta")

    def __str__(self):
        return self.respuesta

    class Meta:
        ordering = ["respuesta"]
        db_table = "respuestas_texto"


class RespuestasTest(models.Model):
    objects = RespuestasTestManager()
    idPregunta = models.ForeignKey("Preguntas", on_delete=models.CASCADE)
    idOpcion = models.ForeignKey("OpcionesTest", on_delete=models.CASCADE)

    def __str__(self):
        return str(self.idPregunta) + "/" + str(self.idOpcion)

    class Meta:
        db_table = "respuestas_test"
        unique_together = ["idPregunta", "idOpcion"]


class Asignaturas(models.Model):
    objects = AsignaturasManager()
    asignatura = models.CharField(blank=True, max_length=254, verbose_name="asignatura")

    def __str__(self):
        return self.asignatura

    class Meta:
        ordering = ["asignatura"]
        db_table = "asignaturas"


class Imparte(models.Model):
    objects = ImparteManager()
    idProfesor = models.ForeignKey(User, on_delete=models.CASCADE)
    idAsignatura = models.ForeignKey("Asignaturas", on_delete=models.CASCADE)

    class Meta:
        db_table = "imparte"
        unique_together = ["idProfesor", "idAsignatura"]


class EsAlumno(models.Model):
    objects = EsAlumnoManager()
    idAlumno = models.ForeignKey(User, on_delete=models.CASCADE)
    idAsignatura = models.ForeignKey("Asignaturas", on_delete=models.CASCADE)

    class Meta:
        db_table = "es_alumno"
        unique_together = ["idAlumno", "idAsignatura"]


class Notas(models.Model):
    objects = NotasManager()
    idAlumno = models.ForeignKey(User, on_delete=models.CASCADE)
    idCuestionario = models.ForeignKey("Cuestionarios", on_delete=models.CASCADE)
    nota = models.DecimalField(default=0, max_digits=10, decimal_places=2, verbose_name="nota")
    hash = models.CharField(blank=True, max_length=254, verbose_name="hash")

    class Meta:
        db_table = "notas"
        unique_together = ("idCuestionario", "idAlumno")


class EnvioOffline(models.Model):
    objects = EnvioOfflineManager()
    idAlumno = models.ForeignKey(User, on_delete=models.CASCADE)
    idCuestionario = models.ForeignKey("Cuestionarios", on_delete=models.CASCADE)
    hash = models.CharField(blank=True, max_length=254, verbose_name="hash")

    class Meta:
        db_table = "Envio_offline"
        unique_together = ("idCuestionario", "idAlumno")


# TODO existen modelos abstractos revisar docs
# https://docs.djangoproject.com/en/dev/topics/db/models/#multi-table-inheritance
# Y este paquete parece que facilita las cosas
# https://django-polymorphic.readthedocs.io/en/latest/
# Aún haciendolo asi no lo veo muy claro para luego en las vistas no hacer distincion entre las instancias


class RespuestasEnviadas(models.Model):
    objects = RespuestasEnviadasManager()
    # TODO Cambiar atributos, no son id's son referencias a la propia tabla
    idCuestionario = models.ForeignKey("Cuestionarios", on_delete=models.CASCADE)
    idAlumno = models.ForeignKey(User, on_delete=models.CASCADE)  # TODO puede ser profesor tambien, vaya nombres :/
    idPregunta = models.ForeignKey("Preguntas", on_delete=models.CASCADE)

    class Meta:
        abstract = True
        ordering = ["idPregunta"]

    @classmethod
    def calcular_nota(cls, respuesta, id_cuestionario):
        # TODO alguna manera mejor de calcular nota?
        pregunta_info = PerteneceACuestionario.objects.get_by_pregunta_cuestionario(id_pregunta=respuesta["id"], id_cuestionario=id_cuestionario)
        opcion_usuario, opcion_correcta = None, None

        if respuesta["type"] == "test":
            opcion_usuario = int(respuesta["answr"])
            opcion_correcta = RespuestasTest.objects.get_by_pregunta(id_pregunta=respuesta["id"]).idOpcion.id
        elif respuesta["type"] == "text":
            opcion_usuario = respuesta["answr"].lower().replace(" ", "")
            opcion_correcta = RespuestasTexto.objects.get_by_pregunta(id_pregunta=respuesta["id"]).respuesta.lower().replace(" ", "")

        if opcion_usuario == opcion_correcta:
            return pregunta_info.puntosAcierto
        else:
            return pregunta_info.puntosFallo


class RespuestasEnviadasTest(RespuestasEnviadas):  # No debería ser on delete cascade
    objects = RespuestasEnviadasTestManager()
    idRespuesta = models.ForeignKey("OpcionesTest", on_delete=models.CASCADE)

    class Meta:
        db_table = "respuestas_enviadas_test"


class RespuestasEnviadasText(RespuestasEnviadas):
    objects = RespuestasEnviadasTextManager()
    Respuesta = models.CharField(blank=True, max_length=254, verbose_name="respuesta")

    class Meta:
        db_table = "respuestas_enviadas_text"
