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

    def create_superuser(self, email, first_name, last_name, password, commit=False, **extra_fields):
        """
        Creates and saves a superuser with the given email, firscommit=False,t name,
        last name and password.
        """
        extra_fields.setdefault("role", "teacher")  # TODO tenian puesto admin pero solo se permite teacher o student
        user = self.create_user(email, password=password, first_name=first_name, last_name=last_name, commit=False, **extra_fields)
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user

    def get_by_id(self, id_usuario):
        return self.get_queryset().get(id=id_usuario)

    def get_users_from_test(self, id_asignatura, id_cuestionario):
        return (
            self.get_queryset()
            .filter(
                Q(cursa__asignatura_id=id_asignatura) | Q(imparte__asignatura_id=id_asignatura),
                Q(intento__cuestionario_id=id_cuestionario) | Q(intento__cuestionario_id__isnull=True),
            )
            .values("id", "first_name", "last_name", "intento__nota","intento__estado","email")
        )

    def get_students(self):
        return self.get_queryset().filter(role="student")


# TODO redefinir aqui metodos necesarios, getById, getBy...
class OpcionesTestManager(models.Manager):
    def create_opciones_test(self, opcion, idPregunta, orden, fijar, commit=False, **extra_fields):
        obj = self.model(opcion=opcion, pregunta_id=idPregunta,orden=orden, fijar=fijar, **extra_fields)
        if commit:
            obj.save()
        return obj

    def get_by_id(self, id_opciones):
        return self.get_queryset().get(id=id_opciones)

    def get_by_pregunta(self, id_pregunta):
        return self.get_queryset().filter(pregunta_id=id_pregunta)


class PreguntasManager(models.Manager):
    def create_preguntas(self, pregunta, idAsignatura, titulo, commit=False, **extra_fields):
        obj = self.model(pregunta=pregunta, asignatura_id=idAsignatura, titulo=titulo, **extra_fields)
        if commit:
            obj.save()
        return obj

    def get_by_id(self, id_pregunta):
        return self.get_queryset().get(id=id_pregunta)

    def get_by_asignatura_titulo(self,id_asignatura, titulo):
        return self.get_queryset().get(asignatura_id=id_asignatura, titulo=titulo)

    # TODO query extraña
    def get_by_asignatura_pregunta_titulo(self, pregunta, id_asignatura, titulo):
        return self.get_queryset().get(pregunta=pregunta, asignatura_id=id_asignatura, titulo=titulo)

    def get_by_asignatura(self, id_asignatura):
        return self.get_queryset().filter(asignatura_id=id_asignatura)


class PreguntasTestManager(models.Manager):
    def create_pregunta_test(self, pregunta, idAsignatura, titulo, id_pregunta, commit=False, **extra_fields):
        obj = self.model(pregunta=pregunta, asignatura_id=idAsignatura, titulo=titulo,pregunta_ptr_id=id_pregunta, **extra_fields)
        if commit:
            obj.save()
        return obj

    def get_by_id(self, id_pregunta):
        return self.get_queryset().get(pregunta_ptr_id=id_pregunta)

    


class PreguntasTextManager(models.Manager):
    def create_pregunta_text(self,  pregunta, idAsignatura, titulo,id_pregunta,respuesta, commit=False, **extra_fields):
        obj = self.model(pregunta=pregunta, asignatura_id=idAsignatura, titulo=titulo,pregunta_ptr_id=id_pregunta,respuesta=respuesta, **extra_fields)
        if commit:
            obj.save()
        return obj

    def get_by_id(self, id_pregunta):
        return self.get_queryset().get(pregunta_ptr_id=id_pregunta)


class CuestionariosQuerySet(models.QuerySet):
    def order_by_fecha_cierre_desc(self):
        return self.order_by("-fecha_cierre")


class CuestionariosManager(models.Manager):
    def get_queryset(self):
        return CuestionariosQuerySet(model=self.model, using=self._db)

    def create_cuestionarios(self, titulo, secuencial, idAsignatura, idProfesor, duracion, password, fecha_cierre, fecha_apertura, fecha_visible, aleatorizar=None, commit=False, **extra_fields):
        obj = self.model(
            titulo=titulo,
            secuencial=secuencial,
            asignatura_id=idAsignatura,
            profesor_id=idProfesor,
            duracion=duracion,
            password=password,
            fecha_cierre=fecha_cierre,
            fecha_apertura=fecha_apertura,
            fecha_visible=fecha_visible,
            **extra_fields
        )
        if aleatorizar is not None:
            obj.aleatorizar = aleatorizar
        if commit:
            obj.save()
        return obj

    def get_by_id(self, id_cuestionario):
        return self.get_queryset().get(id=id_cuestionario)

    def get_by_asignatura(self, id_asignatura):
        return self.get_queryset().filter(asignatura_id=id_asignatura)

    def order_by_fecha_cierre_desc(self):
        return self.get_queryset().order_by_fecha_cierre_desc()


#TODO comprobar que para PregAleatoria funciona
class SeleccionPreguntaManager(models.Manager):
    def create_seleccion_pregunta(self, tipo, puntosAcierto, puntosFallo, idCuestionario , orden, fijar,aleatorizar=None, idPregunta=None, commit=False, **extra_fields):
        obj = self.model(puntosAcierto=puntosAcierto, puntosFallo=puntosFallo,tipo=tipo, cuestionario_id=idCuestionario, pregunta_id=idPregunta, orden=orden, fijar=fijar, **extra_fields)
        if aleatorizar is not None:
            obj.aleatorizar = aleatorizar        
        if commit:
            obj.save()
        return obj

    # def get_by_seleccion_cuestionario(self, id_pregunta, id_cuestionario):
    #     return self.get_queryset().get(pregunta_id=id_pregunta, cuestionario_id=id_cuestionario)

    def get_by_cuestionario(self, id_cuestionario):
        return self.get_queryset().filter(cuestionario_id=id_cuestionario)
    
    def get_by_pregunta(self, id_pregunta):
        return self.get_queryset().filter(pregunta_id=id_pregunta)
    

class OpcionPreguntaAleatoriaManager(models.Manager):
    def create_opcion_pregunta_aleatoria(self, id_pregunta, id_pregunta_aleatoria, commit=False, **extra_fields):
        obj = self.model(pregunta_id=id_pregunta, pregunta_aleatoria_id = id_pregunta_aleatoria, **extra_fields)
        if commit:
            obj.save()
        return obj
    
    def get_by_pregunta_aleatoria(self,id_pregunta_aleatoria):
        return self.get_queryset().filter(pregunta_aleatoria_id = id_pregunta_aleatoria)

class AsignaturaManager(models.Manager):
    # TODO no se crean
    def create_asignaturas(self, commit=False, **extra_fields):
        obj = self.model(**extra_fields)
        if commit:
            obj.save()
        return obj

    def get_by_id(self, id_asignatura):
        return self.get_queryset().get(id=id_asignatura)

    def get_by_asignatura(self, nombre_asignatura):
        return self.get_queryset().get(nombreAsignatura=nombre_asignatura)


class ImparteQuerySet(models.QuerySet):
    def order_by_id_asignatura(self):
        return self.order_by("asignatura")


class ImparteManager(models.Manager):
    def get_queryset(self):
        return ImparteQuerySet(model=self.model, using=self._db)

    # TODO no se crean
    def create_imparte(self, commit=False, **extra_fields):
        obj = self.model(**extra_fields)
        if commit:
            obj.save()
        return obj

    def get_by_profesor(self, id_profesor):
        return self.get_queryset().filter(profesor_id=id_profesor)
    
    def get_by_profesor_in_asignatura(self, id_profesor,id_asignatura):
        return self.get_queryset().get(profesor_id=id_profesor, asignatura_id=id_asignatura)

    def order_by_id_asignatura(self):
        return self.get_queryset().order_by_id_asignatura()


class EsAlumnoQuerySet(models.QuerySet):
    def order_by_id_asignatura(self):
        return self.order_by("asignatura")


class CursaManager(models.Manager):
    def get_queryset(self):
        return ImparteQuerySet(model=self.model, using=self._db)

    def create_es_alumno(self, idAlumno, idAsignatura, commit=False, **extra_fields):
        obj = self.model(alumno_id=idAlumno, asignatura_id=idAsignatura, **extra_fields)
        if commit:
            obj.save()
        return obj

    def get_by_alumno(self, id_alumno):
        return self.get_queryset().filter(alumno_id=id_alumno)

    def get_by_asignatura(self, id_asignatura):
        return self.get_queryset().filter(asignatura_id=id_asignatura)

    def get_by_alumno_asignatura(self, id_alumno, id_asignatura):
        return self.get_queryset().filter(alumno_id=id_alumno, asignatura_id=id_asignatura)

    def order_by_id_asignatura(self):
        return self.get_queryset().order_by_id_asignatura()


class IntentoManager(models.Manager):
    def create_intento(self, idAlumno, idCuestionario, nota=None, hash=None, hash_offline=None, commit=False, **extra_fields):
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
        from api.models import Intento  # TODO dependencia circular si no se importa aqui
        return self.get_queryset().filter(cuestionario__in=cuestionarios, usuario_id=id_alumno, estado=Intento.Estado.ENTREGADO).count()

class InstanciaPreguntaManager(models.Manager):
    def create_instancia(self, id_intento, id_pregunta,orden,id_seleccion, commit=False, **extra_fields):
        obj = self.model(intento_id=id_intento, pregunta_id=id_pregunta,orden=orden,seleccion_id=id_seleccion, **extra_fields)
        if commit:
            obj.save()
        return obj

    def get_by_intento_pregunta(self, id_intento, id_pregunta):
        return self.get_queryset().filter(intento_id=id_intento, pregunta_id=id_pregunta).first()

    def get_by_intento(self, id_intento):
        return self.get_queryset().filter(intento_id=id_intento)


class InstanciaPreguntaTestManager(InstanciaPreguntaManager):
    def create_instancia(self, id_intento, id_pregunta, orden,id_seleccion, commit=False, id_respuesta=None,**extra_fields):
        obj = super().create_instancia(id_intento=id_intento, id_pregunta=id_pregunta,orden=orden,id_seleccion=id_seleccion)
        obj.respuesta_id=id_respuesta
        if commit:
            obj.save()
        return obj

    # TODO first es un apaño
    # def get_by_intento_pregunta(self, id_intento, id_pregunta):
    #     return self.get_queryset().filter(intento_id=id_intento, pregunta_id=id_pregunta).first()


class InstanciaPreguntaTextManager(InstanciaPreguntaManager):
    def create_instancia(self, id_intento, id_pregunta, orden, id_seleccion,commit=False,respuesta=None, **extra_fields):
        obj = super().create_instancia(id_intento=id_intento, id_pregunta=id_pregunta,orden=orden,id_seleccion=id_seleccion)
        obj.respuesta=respuesta
        if commit:
            obj.save()
        return obj

    # TODO Herencia :)
    # def get_by_intento_pregunta(self, id_intento, id_pregunta):
    #     return self.get_queryset().filter(intento_id=id_intento, pregunta_id=id_pregunta).first()

class InstanciaOpcionTestManager(models.Manager):
    def create_instancia(self, id_instancia, id_opcion, orden, commit=False, **extra_fields):
        obj = self.model(instancia_id=id_instancia,respuesta_id=id_opcion,orden=orden, **extra_fields)
        if commit:
            obj.save()
        return obj
    
    def get_by_instpregunta_opcion(self,id_instpregunta, id_opcion):
        return self.get_queryset().get(instancia_id=id_instpregunta,respuesta_id=id_opcion)
