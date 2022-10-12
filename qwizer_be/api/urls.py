from django.urls import path,include
from rest_framework import routers
from .viewss import TestsViewSet
from . import views

router = routers.DefaultRouter()

router.register('tests',TestsViewSet,'tests')

urlpatterns = router.urls
urlpatterns += [
    #TODO Esto es un paquete que ofrece metodos para autenticar
    # revisar si nos renta o es mejor implementarlo a mano
    # https://djoser.readthedocs.io/en/latest/getting_started.html
    path("auth/", include("djoser.urls")),

    #TODO No he visto que se use
    path('register',views.registro,name='register'),

    #NoSeDondeMeterloTodavia
    path('insert-qr', views.insert_qr, name='insert-qr'),
    path('get-hashes', views.get_hashes, name='get-hashes'),

    #Questions
    path('delete-question', views.delete_question, name='delete-question'),
    path('update-question', views.update_question, name='update-question'),
    path('upload-questions', views.upload_questions, name='upload-questions'),

    #Subjects
    path('get-subjects',views.get_subjects,name='get-subjects'),
    path('get-quizzes', views.get_quizzes, name='get-quizzes'),
    path('get-all-subjects',views.get_all_subjects,name='get-all-subjects'),
    path('get-subject-questions', views.get_subject_questions, name='get-subject-questions'),
    path('enroll-students', views.enroll_students, name='enroll-students'),
    path('get-subject-info', views.get_subject_info, name='get-subject-info'),

    #Tests
    path('response',views.response,name='response'),
    path('test-corrected',views.testCorrected,name='test-corrected'),
    path('create-quiz', views.create_quiz, name='create-quiz'),
    path('get-quiz-grades', views.get_quiz_grades, name='get-quiz-grades'),
    path('test',views.test,name='test'),
    path('get-quiz-info', views.get_quiz_info, name='get-quiz-info'),
    path('upload', views.upload, name='upload'),

    #Users
    path('login',views.app_login,name='login'),
    path('logout',views.app_logout,name='logout'),
    path('get-students', views.get_students, name='get-students'),
]
