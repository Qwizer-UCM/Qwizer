from django.urls import path
from djoser.views import UserViewSet, TokenCreateView, TokenDestroyView
from rest_framework import routers
from .views import qr, question, subject, test, user

router = routers.DefaultRouter(trailing_slash=False)

# TODO pendiente poner permission_classes
router.register('qr',qr.QRViewSet,'qr')
router.register('question',question.QuestionViewSet,'question')
router.register('subject',subject.SubjectViewSet,'subject')
router.register('test',test.TestsViewSet,'test')

urlpatterns = router.urls
urlpatterns += [
    # TODO Esto es un paquete que ofrece metodos para autenticar
    # revisar si nos renta o es mejor implementarlo a mano
    # https://djoser.readthedocs.io/en/latest/getting_started.html
    path("auth/user/me", UserViewSet.as_view({"get": "me"})),
    path("auth/token/login", TokenCreateView.as_view()),
    path("auth/token/logout", TokenDestroyView.as_view()),
    # Users
    # TODO pasar a viewset y usar el manager
    path("estudiantes", user.get_students, name="estudiantes"),
    path("estudiantes/<int:idAsignatura>", user.get_studentsFromAsignatura, name="estudiantesAsignatura"),
    path("estudiantes/<int:idAsignatura>/disponibles",user.get_studentsForEnroll, name="estudiantesNoAsignatura")

]
