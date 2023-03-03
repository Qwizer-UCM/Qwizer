from django.db import models
from django.db.models.signals import post_save
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from django.dispatch import receiver
from rest_framework.authtoken.models import Token

from api.manager import (
    AsignaturaManager,
    CuestionariosManager,
    CursaManager,
    ImparteManager,
    InstanciaOpcionTestManager,
    IntentoManager,
    OpcionesTestManager,
    SeleccionPreguntaManager,
    OpcionPreguntaAleatoriaManager,
    PreguntasManager,
    PreguntasTestManager,
    PreguntasTextManager,
    InstanciaPreguntaManager,
    InstanciaPreguntaTestManager,
    InstanciaPreguntaTextManager,
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
    STUDENT = 'student'
    TEACHER = 'teacher'
    ADMIN = 'admin'
    ROLE_CHOICES = [
        (STUDENT,"student"),
        (TEACHER,"teacher"),
        (ADMIN,"admin"),
    ]
    role = models.CharField(_("role"), choices=ROLE_CHOICES, max_length=7, blank=False)

    is_active = models.BooleanField(
        _("active"),
        default=True,
        help_text=_("Designates whether this user should be treated as active. Unselect this instead of deleting accounts."),
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

class OpcionTest(models.Model):
    objects = OpcionesTestManager()
    pregunta = models.ForeignKey("PreguntaTest", related_name="opciones_test", on_delete=models.CASCADE)
    opcion = models.CharField(blank=True, max_length=254, verbose_name="opcion")
    orden = models.PositiveSmallIntegerField()
    fijar = models.BooleanField(default=False)

    # TODO no estoy seguro de que sea lo ideal pero nos permite refactorizar con facilidad
    # https://docs.djangoproject.com/en/4.1/ref/models/instances/

    def __str__(self):
        return self.opcion

    class Meta:
        unique_together = (
            "pregunta",
            "opcion",
        )


class Pregunta(models.Model):
    objects = PreguntasManager()
    pregunta = models.CharField(blank=True, max_length=254, verbose_name="enunciado")
    asignatura = models.ForeignKey("Asignatura", on_delete=models.CASCADE)
    titulo = models.CharField(blank=True, max_length=254, verbose_name="titulo")

    def __str__(self):
        return self.pregunta

    class Meta:
        ordering = ["pregunta"]

class PreguntaTest(Pregunta):
    objects = PreguntasTestManager()
    respuesta = models.ForeignKey(OpcionTest,null=True ,on_delete=models.CASCADE)

class PreguntaText(Pregunta):
    objects = PreguntasTextManager()
    respuesta = models.TextField()

class Cuestionario(models.Model):
    objects = CuestionariosManager()
    titulo = models.CharField(blank=True, max_length=100, verbose_name="titulo")
    profesor = models.ForeignKey(User, on_delete=models.CASCADE)
    asignatura = models.ForeignKey("Asignatura", on_delete=models.CASCADE)
    duracion = models.IntegerField(default=10, verbose_name="duracion")
    secuencial = models.BooleanField(default=False, verbose_name="secuencial")  # 0 no es secuencial, 1 es secuencial
    password = models.CharField(blank=True, max_length=300, verbose_name="password")
    fecha_visible = models.DateTimeField(blank=False, verbose_name="fecha_visible")
    fecha_apertura = models.DateTimeField(blank=False, verbose_name="fecha_apertura")
    fecha_cierre = models.DateTimeField(blank=False, verbose_name="fecha_cierre")
    aleatorizar = models.BooleanField(default=False)

    def __str__(self):
        return self.titulo

    class Meta:
        ordering = ["titulo"]
        unique_together = (
            "asignatura",
            "titulo",
        )  # No puede haber dos cuestionarios con el mismo nombre para una asignatura


class SeleccionPregunta(models.Model):
    objects = SeleccionPreguntaManager()
    pregunta = models.ForeignKey(Pregunta, related_name="preguntas", on_delete=models.CASCADE, default=None, null=True)
    cuestionario = models.ForeignKey(Cuestionario, on_delete=models.CASCADE)
    puntosAcierto = models.DecimalField(default=0, max_digits=30, decimal_places=2, verbose_name="puntosAcierto")
    puntosFallo = models.DecimalField(default=0, max_digits=30, decimal_places=2, verbose_name="puntosFallo")
    orden = models.PositiveSmallIntegerField()
    fijar = models.BooleanField(default=False)
    aleatorizar = models.BooleanField(default=False)

    class Tipo(models.TextChoices):
        PREGBANCO = 'PRB', _('PreguntaBanco')
        PREGALEATORIA = 'PRA', _('PreguntaAleatoria')

    tipo = models.CharField(
        max_length=3,
        choices=Tipo.choices
    )

    def __str__(self):
        return str(self.pregunta) + "/" + str(self.cuestionario)

    class Meta:
        ordering = ["cuestionario"]

# TODO NAMING 
class OpcionPreguntaAleatoria(models.Model):
    objects = OpcionPreguntaAleatoriaManager()
    pregunta_aleatoria = models.ForeignKey(SeleccionPregunta, related_name="opciones_preguntas", on_delete=models.CASCADE)
    pregunta = models.ForeignKey(Pregunta, related_name="preguntas_opciones", on_delete=models.CASCADE)




class Asignatura(models.Model):
    objects = AsignaturaManager()
    nombreAsignatura = models.CharField(blank=True, max_length=254, verbose_name="nombreAsignatura", unique=True)

    def __str__(self):
        return self.nombreAsignatura

    class Meta:
        ordering = ["nombreAsignatura"]


class Imparte(models.Model):
    objects = ImparteManager()
    profesor = models.ForeignKey(User, on_delete=models.CASCADE)
    asignatura = models.ForeignKey(Asignatura, on_delete=models.CASCADE)

    class Meta:
        verbose_name_plural = "Imparte"
        unique_together = ["profesor", "asignatura"]


class Cursa(models.Model):
    objects = CursaManager()
    alumno = models.ForeignKey(User, on_delete=models.CASCADE)
    asignatura = models.ForeignKey(Asignatura, on_delete=models.CASCADE)

    class Meta:
        unique_together = ["alumno", "asignatura"]

class Intento(models.Model):
    objects = IntentoManager()
    usuario = models.ForeignKey(User, on_delete=models.CASCADE)
    cuestionario = models.ForeignKey(Cuestionario, on_delete=models.CASCADE)
    nota = models.DecimalField(default=0, max_digits=10, decimal_places=2, verbose_name="nota")
    hash = models.CharField(blank=True, max_length=254, verbose_name="hash")
    hash_offline = models.CharField(blank=True, max_length=254, verbose_name="hash_offline")
    fecha_inicio = models.DateTimeField(null=True,blank=False, verbose_name="fecha_inicio")
    fecha_fin = models.DateTimeField(null=True,blank=False, verbose_name="fecha_fin")

    class Estado(models.TextChoices):
        PENDIENTE = 'PEN', _('Pendiente')
        ENTREGADO = 'ENT', _('Entregado')

    estado = models.CharField(
        max_length=3,
        choices=Estado.choices,
        default=Estado.PENDIENTE,
    )

    class Meta:
        unique_together = ("usuario","cuestionario")

# TODO existen modelos abstractos revisar docs
# https://docs.djangoproject.com/en/dev/topics/db/models/#multi-table-inheritance
# Y este paquete parece que facilita las cosas
# https://django-polymorphic.readthedocs.io/en/latest/
# Aún haciendolo asi no lo veo muy claro para luego en las vistas no hacer distincion entre las instancias


class InstanciaPregunta(models.Model):
    objects = InstanciaPreguntaManager()
    intento = models.ForeignKey(Intento, on_delete=models.CASCADE)
    pregunta = models.ForeignKey(SeleccionPregunta, on_delete=models.CASCADE)
    orden = models.PositiveSmallIntegerField()

    class Meta:
        ordering = ["pregunta"]

    @classmethod
    def calcular_nota(cls, respuesta, id_cuestionario):
        # TODO alguna manera mejor de calcular nota?
        pregunta_info = SeleccionPregunta.objects.get_by_pregunta_cuestionario(id_pregunta=respuesta["id"], id_cuestionario=id_cuestionario)
        opcion_usuario, opcion_correcta = None, None

        if respuesta["type"] == "test":
            opcion_usuario = int(respuesta["answr"] or -1)
            opcion_correcta = pregunta_info.pregunta.preguntatest.respuesta.id
        elif respuesta["type"] == "text":
            opcion_usuario = respuesta["answr"].lower().replace(" ", "")
            opcion_correcta = pregunta_info.pregunta.preguntatext.respuesta.lower().replace(" ", "")

        if opcion_usuario == opcion_correcta:
            return pregunta_info.puntosAcierto
        else:
            return -pregunta_info.puntosFallo


class InstanciaPreguntaTest(InstanciaPregunta):  # No debería ser on delete cascade
    objects = InstanciaPreguntaTestManager()
    respuesta = models.ForeignKey(OpcionTest, on_delete=models.CASCADE,null=True, blank=True)


class InstanciaPreguntaText(InstanciaPregunta):
    objects = InstanciaPreguntaTextManager()
    respuesta = models.CharField(null=True, blank=True, max_length=254, verbose_name="respuesta")

class InstanciaOpcionTest(models.Model):
    objects = InstanciaOpcionTestManager()
    instancia = models.ForeignKey(InstanciaPreguntaTest, on_delete=models.CASCADE)
    respuesta = models.ForeignKey(OpcionTest, on_delete=models.CASCADE, null=True, blank=True)
    orden = models.PositiveSmallIntegerField()
