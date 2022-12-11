from django.contrib.auth.models import BaseUserManager
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.db.models import Q


class UserManager(BaseUserManager):
    def create_user(self, email, first_name, last_name, password=None, commit=True, **extra_fields):
        """
        Creates  and saves a User with the given email, first name, lascommit=False,t name
        and password.
        """

        if not email:
            raise ValueError(_("Users must have an email address"))
        if not first_name:
            raise ValueError(_("Users must have a first name"))
        if not last_name:
            raise ValueError(_("Users must have a last name"))
        if extra_fields.get("role") not in ["student", "teacher"]:
            raise ValueError(_("Users must have student or teacher role"))

        user = self.model(email=self.normalize_email(email), first_name=first_name, last_name=last_name, **extra_fields)

        user.set_password(password)
        if commit:
            user.save(using=self._db)
        return user

    def create_superuser(self, email, first_name, last_name, password, commit=False,**extra_fields):
        """
        Creates and saves a superuser with the given email, firscommit=False,t name,
        last name and password.
        """
        extra_fields.setdefault("role", "teacher")  # TODO tenian puesto admin pero solo se permite teacher o student
        user = self.create_user(email, password=password, first_name=first_name, last_name=last_name, commit=False,**extra_fields)
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user

    def get_by_id(self, id_usuario):
        return self.get_queryset().get(id=id_usuario)

    def get_users_from_test(self, id_asignatura, id_cuestionario):
        return self.get_queryset().filter(
            Q(esalumno__idAsignatura_id=id_asignatura) | Q(imparte__idAsignatura_id=id_asignatura),
            Q(notas__idCuestionario_id=id_cuestionario) | Q(notas__idCuestionario_id__isnull=True),
        ).values("id", "first_name", "last_name", "notas__nota")

    def get_students(self):
        return self.get_queryset().filter(role="student")


# TODO redefinir aqui metodos necesarios, getById, getBy...
class OpcionesTestManager(models.Manager):
    def create_opciones_test(self, opcion, idPregunta, commit=False,**extra_fields):
        obj = self.model(opcion=opcion, idPregunta=idPregunta, **extra_fields)
        if commit:
            obj.save()
        return obj

    def get_by_id(self, id_opciones):
        return self.get_queryset().get(id=id_opciones)

    def get_by_pregunta(self, id_pregunta):
        return self.get_queryset().filter(idPregunta_id=id_pregunta)


class PreguntasManager(models.Manager):
    def create_preguntas(self, tipoPregunta, pregunta, idAsignatura, titulo, commit=False,**extra_fields):
        obj = self.model(tipoPregunta=tipoPregunta, pregunta=pregunta, idAsignatura=idAsignatura, titulo=titulo, **extra_fields)
        if commit:
            obj.save()
        return obj

    def get_by_id(self, id_pregunta):
        return self.get_queryset().get(id=id_pregunta)

    # TODO query extraña
    def get_by_asignatura_pregunta_tipo_titulo(self, tipo, pregunta, id_asignatura, titulo):
        return self.get_queryset().get(tipoPregunta=tipo, pregunta=pregunta, idAsignatura_id=id_asignatura, titulo=titulo)

    def get_by_asignatura(self, id_asignatura):
        return self.get_queryset().filter(idAsignatura_id=id_asignatura)


class CuestionariosQuerySet(models.QuerySet):
    def order_by_fecha_cierre_desc(self):
        return self.order_by("-fecha_cierre")


class CuestionariosManager(models.Manager):
    def get_queryset(self):
        return CuestionariosQuerySet(model=self.model, using=self._db)

    def create_cuestionarios(self, titulo, secuencial, idAsignatura, idProfesor, duracion, password, fecha_cierre, fecha_apertura, commit=False,**extra_fields):
        obj = self.model(
            titulo=titulo,
            secuencial=secuencial,
            idAsignatura=idAsignatura,
            idProfesor=idProfesor,
            duracion=duracion,
            password=password,
            fecha_cierre=fecha_cierre,
            fecha_apertura=fecha_apertura,
            **extra_fields
        )
        if commit:
            obj.save()
        return obj

    def get_by_id(self, id_cuestionario):
        return self.get_queryset().get(id=id_cuestionario)

    def get_by_asignatura(self, id_asignatura):
        return self.get_queryset().filter(idAsignatura_id=id_asignatura)

    def order_by_fecha_cierre_desc(self):
        return self.get_queryset().order_by_fecha_cierre_desc()


class PerteneceACuestionarioManager(models.Manager):
    def create_pertenece_a_cuestionario(self, nQuestion, puntosAcierto, puntosFallo, idCuestionario, idPregunta, commit=False,**extra_fields):
        obj = self.model(nQuestion=nQuestion, puntosAcierto=puntosAcierto, puntosFallo=puntosFallo, idCuestionario=idCuestionario, idPregunta=idPregunta, **extra_fields)
        if commit:
            obj.save()
        return obj

    def get_by_pregunta_cuestionario(self, id_pregunta, id_cuestionario):
        return self.get_queryset().get(idPregunta_id=id_pregunta, idCuestionario_id=id_cuestionario)

    def get_by_cuestionario(self, id_cuestionario):
        return self.get_queryset().filter(idCuestionario_id=id_cuestionario)


class RespuestasTextoManager(models.Manager):
    def create_respuestas_texto(self, respuesta, idPregunta, commit=False,**extra_fields):
        obj = self.model(respuesta=respuesta, idPregunta=idPregunta, **extra_fields)
        if commit:
            obj.save()
        return obj

    def get_by_pregunta(self, id_pregunta):
        return self.get_queryset().get(idPregunta_id=id_pregunta)


class RespuestasTestManager(models.Manager):
    def create_respuestas_test(self, idOpcion, idPregunta, commit=False,**extra_fields):
        obj = self.model(idOpcion=idOpcion, idPregunta=idPregunta, **extra_fields)
        if commit:
            obj.save()
        return obj

    def get_by_pregunta(self, id_pregunta):
        return self.get_queryset().get(idPregunta=id_pregunta)


class AsignaturasManager(models.Manager):
    # TODO no se crean
    def create_asignaturas(self, commit=False,**extra_fields):
        obj = self.model(**extra_fields)
        if commit:
            obj.save()
        return obj

    def get_by_id(self, id_asignatura):
        return self.get_queryset().get(id=id_asignatura)

    def get_by_asignatura(self, nombre_asignatura):
        return self.get_queryset().get(asignatura=nombre_asignatura)


class ImparteQuerySet(models.QuerySet):
    def order_by_id_asignatura(self):
        return self.order_by("idAsignatura")


class ImparteManager(models.Manager):
    def get_queryset(self):
        return ImparteQuerySet(model=self.model, using=self._db)

    # TODO no se crean
    def create_imparte(self, commit=False,**extra_fields):
        obj = self.model(**extra_fields)
        if commit:
            obj.save()
        return obj

    def get_by_profesor(self, id_profesor):
        return self.get_queryset().filter(idProfesor_id=id_profesor)

    def order_by_id_asignatura(self):
        return self.get_queryset().order_by_id_asignatura()


class EsAlumnoQuerySet(models.QuerySet):
    def order_by_id_asignatura(self):
        return self.order_by("idAsignatura")


class EsAlumnoManager(models.Manager):
    def get_queryset(self):
        return ImparteQuerySet(model=self.model, using=self._db)

    def create_es_alumno(self, idAlumno, idAsignatura, commit=False,**extra_fields):
        obj = self.model(idAlumno=idAlumno, idAsignatura=idAsignatura, **extra_fields)
        if commit:
            obj.save()
        return obj

    def get_by_alumno(self, id_alumno):
        return self.get_queryset().filter(idAlumno_id=id_alumno)

    def order_by_id_asignatura(self):
        return self.get_queryset().order_by_id_asignatura()


class NotasManager(models.Manager):
    def create_notas(self, idAlumno, idCuestionario, nota, hash, commit=False,**extra_fields):
        obj = self.model(idAlumno=idAlumno, idCuestionario=idCuestionario, nota=nota, hash=hash, **extra_fields)
        if commit:
            obj.save()
        return obj

    def get_by_cuestionario_alumno(self, id_cuestionario, id_alumno):
        return self.get_queryset().get(idCuestionario_id=id_cuestionario, idAlumno_id=id_alumno)

    def count_corregidos(self, cuestionarios, id_alumno):
        return self.get_queryset().filter(idCuestionario__in=cuestionarios, idAlumno_id=id_alumno).count()


class EnvioOfflineManager(models.Manager):
    def create_envio_offline(self, idAlumno, idCuestionario, hash, commit=False,**extra_fields):
        obj = self.model(idAlumno=idAlumno, idCuestionario=idCuestionario, hash=hash, **extra_fields)
        if commit:
            obj.save()
        return obj

    def get_by_cuestionario_alumno(self, id_cuestionario, id_alumno):
        return self.get_queryset().get(idCuestionario_id=id_cuestionario, idAlumno_id=id_alumno)


class RespuestasEnviadasTestManager(models.Manager):
    def create_respuesta(self, idCuestionario, idAlumno, idPregunta, idRespuesta, commit=False,**extra_fields):
        obj = self.model(idCuestionario=idCuestionario, idAlumno=idAlumno, idPregunta=idPregunta, idRespuesta=idRespuesta, **extra_fields)
        if commit:
            obj.save()
        return obj

    # TODO first es un apaño
    def get_by_cuestionario_alumno_pregunta(self, id_cuestionario, id_alumno, id_pregunta):
        return self.get_queryset().filter(idCuestionario_id=id_cuestionario, idAlumno_id=id_alumno, idPregunta_id=id_pregunta).first()


class RespuestasEnviadasTextManager(models.Manager):
    def create_respuesta(self, idCuestionario, idAlumno, idPregunta, Respuesta, commit=False,**extra_fields):
        obj = self.model(idCuestionario=idCuestionario, idAlumno=idAlumno, idPregunta=idPregunta, Respuesta=Respuesta, **extra_fields)
        if commit:
            obj.save()
        return obj

    def get_by_cuestionario_alumno_pregunta(self, id_cuestionario, id_alumno, id_pregunta):
        return self.get_queryset().filter(idCuestionario_id=id_cuestionario, idAlumno_id=id_alumno, idPregunta_id=id_pregunta).first()


class RespuestasEnviadasManager(models.Manager):
    # TODO reemplazar instancias por id's
    def create_respuesta(self, idCuestionario, idAlumno, idPregunta, Respuesta=None, idRespuesta=None, commit=False,**extra_fields):
        obj = self.model(idCuestionario=idCuestionario, idAlumno=idAlumno, idPregunta=idPregunta, **extra_fields)
        # Son exclusivas entre sí, seguramente hay una mejor manera de hacerlo
        if Respuesta is not None:
            obj.Respuesta = Respuesta
        if idRespuesta is not None:
            obj.idRespuesta = idRespuesta
        if commit:
            obj.save()
        return obj

    def get_by_cuestionario_alumno_pregunta(self, id_cuestionario, id_alumno, id_pregunta):
        return self.get_queryset().filter(idCuestionario_id=id_cuestionario, idAlumno_id=id_alumno, idPregunta_id=id_pregunta).first()
