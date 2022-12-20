from django.urls import path
from djoser.views import UserViewSet, TokenCreateView, TokenDestroyView
from rest_framework import routers

from api.views import student
from .views import (
    qr,
    # question,
    # subject,
    # test
)

router = routers.DefaultRouter(trailing_slash=False)

# TODO pendiente poner permission_classes
router.register('qr',qr.QRViewSet,'qr')
# router.register('question',question.QuestionViewSet,'question')
## router.register('subject',subject.SubjectViewSet,'subject')
# router.register('test',test.TestsViewSet,'test')
# router.register('estudiantes',student.StudentsViewSet,'estudiantes')


urlpatterns = router.urls
urlpatterns += [
    # TODO Esto es un paquete que ofrece metodos para autenticar
    # revisar si nos renta o es mejor implementarlo a mano
    # https://djoser.readthedocs.io/en/latest/getting_started.html
    path("auth/user/me", UserViewSet.as_view({"get": "me"})),
    path("auth/token/login", TokenCreateView.as_view()),
    path("auth/token/logout", TokenDestroyView.as_view())
]
