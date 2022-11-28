from django.urls import path
from rest_framework import routers
from djoser.views import UserViewSet, TokenCreateView, TokenDestroyView
from .viewss import TestsViewSet
from . import views

router = routers.DefaultRouter()

router.register('tests',views.TestsViewSet,'tests')
#router.register('subjects',views.SubjectsViewSet,'subjects')


urlpatterns = router.urls
urlpatterns += [
    # TODO Esto es un paquete que ofrece metodos para autenticar
    # revisar si nos renta o es mejor implementarlo a mano
    # https://djoser.readthedocs.io/en/latest/getting_started.html
    path("auth/user/me", UserViewSet.as_view({"get": "me"})),
    path("auth/token/login", TokenCreateView.as_view()),
    path("auth/token/logout", TokenDestroyView.as_view()),

    # TODO No he visto que se use
    path("register", views.registro, name="register"),

    # NoSeDondeMeterloTodavia
    path("insert-qr", views.insert_qr, name="insert-qr"),
    path("get-hashes", views.get_hashes, name="get-hashes"),

    # Questions
    path("delete-question", views.delete_question, name="delete-question"),
    path("update-question", views.update_question, name="update-question"),
    path("upload-questions", views.upload_questions, name="upload-questions"),

    # Subjects
    path("asignaturas", views.get_subjects, name="asignaturas"),
    path("asignaturas/<int:idAsignatura>/cuestionarios", views.get_quizzes, name="cuestionarios"),
    path("get-all-subjects", views.get_all_subjects, name="get-all-subjects"), #TODO pensar esta ruta
    path("asignaturas/<int:idAsignatura>/preguntas",views.get_subject_questions, name="preguntas"),
    path("enroll-students", views.enroll_students, name="enroll-students"),

    # Tests
    path("cuestionarios/enviar", views.response, name="enviarCuestionarios"),
    path("cuestionarios/<int:idCuestionario>/nota/<int:idAlumno>", views.testCorrected, name="test-corrected"),
    path("cuestionarios/crear", views.create_quiz, name="create-quiz"),
    path("cuestionarios/<int:idCuestionario>/notas", views.get_quiz_grades, name="get-quiz-grades"),
    path("cuestionarios/<int:idCuestionario>", views.test, name="test"),
    path("cuestionarios/<int:idCuestionario>/info", views.get_quiz_info, name="get-quiz-info"),
    path("cuestionarios/subir", views.upload, name="upload"),
  
    # Users
    path("login", views.app_login, name="login"),
    path("logout", views.app_logout, name="logout"),
    path("estudiantes", views.get_students, name="estudiantes"),
]
