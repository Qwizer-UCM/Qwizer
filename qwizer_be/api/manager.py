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
        obj = self.model(opcion=opcion, pregunta_id=idPregunta, **extra_fields)
        if commit:
            obj.save()
        return obj

    def get_by_id(self, id_opciones):
        return self.get_queryset().get(id=id_opciones)

    def get_by_pregunta(self, id_pregunta):
        return self.get_queryset().filter(pregunta_id=id_pregunta)


class PreguntasManager(models.Manager):
    def create_preguntas(self, pregunta, idAsignatura, titulo, commit=False,**extra_fields):
        obj = self.model(pregunta=pregunta, asignatura_id=idAsignatura, titulo=titulo, **extra_fields)
        if commit:
            obj.save()
        return obj

    def get_by_id(self, id_pregunta):
        return self.get_queryset().get(id=id_pregunta)

    # TODO query extraña
    def get_by_asignatura_pregunta_titulo(self, pregunta, id_asignatura, titulo):
        return self.get_queryset().get(pregunta=pregunta, asignatura_id=id_asignatura, titulo=titulo)

    def get_by_asignatura(self, id_asignatura):
        return self.get_queryset().filter(asignatura_id=id_asignatura)

class PreguntasTestManager(models.Manager):
    def create_preguntasTest(self, idPregunta, respuesta, commit=False,**extra_fields):
        obj = self.model(id=idPregunta,respuesta=respuesta, **extra_fields)
        if commit:
            obj.save()
        return obj

    def get_by_id(self, id_pregunta):
        return self.get_queryset().get(id=id_pregunta)

class PreguntasTextManager(models.Manager):
    def create_preguntasText(self, pregunta, idAsignatura, titulo, commit=False,**extra_fields):
        obj = self.model(pregunta=pregunta, asignatura_id=idAsignatura, titulo=titulo, **extra_fields)
        if commit:
            obj.save()
        return obj

    def get_by_id(self, id_pregunta):
        return self.get_queryset().get(id=id_pregunta)

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
            asignatura_id=idAsignatura,
            profesor_id=idProfesor,
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
        return self.get_queryset().filter(asignatura_id=id_asignatura)

    def order_by_fecha_cierre_desc(self):
        return self.get_queryset().order_by_fecha_cierre_desc()


class PreguntaCuestionarioManager(models.Manager):
    def create_pertenece_a_cuestionario(self, nQuestion, puntosAcierto, puntosFallo, idCuestionario, idPregunta, commit=False,**extra_fields):
        obj = self.model(nPregunta=nQuestion, puntosAcierto=puntosAcierto, puntosFallo=puntosFallo, cuestionario_id=idCuestionario, pregunta_id=idPregunta, **extra_fields)
        if commit:
            obj.save()
        return obj

    def get_by_pregunta_cuestionario(self, id_pregunta, id_cuestionario):
        return self.get_queryset().get(pregunta_id=id_pregunta, cuestionario_id=id_cuestionario)

    def get_by_cuestionario(self, id_cuestionario):
        return self.get_queryset().filter(cuestionario_id=id_cuestionario)

class AsignaturaManager(models.Manager):
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
        return self.get_queryset().filter(profesor_id=id_profesor)

    def order_by_id_asignatura(self):
        return self.get_queryset().order_by_id_asignatura()


class EsAlumnoQuerySet(models.QuerySet):
    def order_by_id_asignatura(self):
        return self.order_by("idAsignatura")


class CursaManager(models.Manager):
    def get_queryset(self):
        return ImparteQuerySet(model=self.model, using=self._db)

    def create_es_alumno(self, idAlumno, idAsignatura, commit=False,**extra_fields):
        obj = self.model(alumno_id=idAlumno, asignatura_id=idAsignatura, **extra_fields)
        if commit:
            obj.save()
        return obj

    def get_by_alumno(self, id_alumno):
        return self.get_queryset().filter(alumno_id=id_alumno)

    def get_by_asignatura(self,id_asignatura):
        return self.get_queryset().filter(asignatura_id=id_asignatura)

    def get_by_alumno_asignatura(self,id_alumno,id_asignatura):
        return self.get_queryset().filter(alumno_id=id_alumno,asignatura_id=id_asignatura)

    def order_by_id_asignatura(self):
        return self.get_queryset().order_by_id_asignatura()


class IntentoManager(models.Manager):
    def create_intento(self, idAlumno, idCuestionario, nota=None,hash=None, hash_offline=None, commit=False,**extra_fields):
        obj = self.model(usuario_id=idAlumno, cuestionario_id=idCuestionario, **extra_fields)
        if hash is not None:
            obj.hash = hash
        if hash_offline is not None:
            obj.hash_offline = hash_offline
        if nota is not None:
            obj.nota = nota
        if commit:
            obj.save()
        return obj

    def get_by_cuestionario_alumno(self, id_cuestionario, id_alumno):
        return self.get_queryset().get(cuestionario_id=id_cuestionario, usuario_id=id_alumno)

    def count_corregidos(self, cuestionarios, id_alumno):
        return self.get_queryset().filter(cuestionario__in=cuestionarios, usuario_id=id_alumno).count()


class RespuestasEnviadasTestManager(models.Manager):
    def create_respuesta(self, idCuestionario, idAlumno, idPregunta, idRespuesta, commit=False,**extra_fields):
        obj = self.model(cuestionario_id=idCuestionario, alumno_id=idAlumno, pregunta_id=idPregunta, respuesta_id=idRespuesta, **extra_fields)
        if commit:
            obj.save()
        return obj

    # TODO first es un apaño
    def get_by_cuestionario_alumno_pregunta(self, id_cuestionario, id_alumno, id_pregunta):
        return self.get_queryset().filter(cuestionario_id=id_cuestionario, alumno_id=id_alumno, pregunta_id=id_pregunta).first()


class RespuestasEnviadasTextManager(models.Manager):
    def create_respuesta(self, idCuestionario, idAlumno, idPregunta, Respuesta, commit=False,**extra_fields):
        obj = self.model(cuestionario_id=idCuestionario, alumno_id=idAlumno, pregunta_id=idPregunta, respuesta=Respuesta, **extra_fields)
        if commit:
            obj.save()
        return obj

    def get_by_cuestionario_alumno_pregunta(self, id_cuestionario, id_alumno, id_pregunta):
        return self.get_queryset().filter(cuestionario_id=id_cuestionario, alumno_id=id_alumno, pregunta_id=id_pregunta).first()


class RespuestasEnviadasManager(models.Manager):
    # TODO reemplazar instancias por id's
    def create_respuesta(self, idCuestionario, idAlumno, idPregunta, Respuesta=None, idRespuesta=None, commit=False,**extra_fields):
        obj = self.model(cuestionario_id=idCuestionario, alumno_id=idAlumno, pregunta_id=idPregunta, **extra_fields)
        # Son exclusivas entre sí, seguramente hay una mejor manera de hacerlo
        if Respuesta is not None:
            obj.Respuesta = Respuesta
        if idRespuesta is not None:
            obj.idRespuesta = idRespuesta
        if commit:
            obj.save()
        return obj

    def get_by_cuestionario_alumno_pregunta(self, id_cuestionario, id_alumno, id_pregunta):
        return self.get_queryset().filter(cuestionario_id=id_cuestionario, alumno_id=id_alumno, pregunta_id=id_pregunta).first()
