"""qwizer_be URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include

from rest_framework import permissions
from rest_framework.routers import re_path
from drf_yasg.views import get_schema_view
from drf_yasg import openapi


# TODO Swagger sirve para autodocumentar la api accediendo a /swagger
# ademas de poder exportarlo a postman y poder probar la api facilmente
# en producción deberia quitarse


SchemaView = get_schema_view(
   openapi.Info(
      title="Qwizer API",
      default_version='v1',
      description="",
      terms_of_service="",
      contact=openapi.Contact(email=""),
      license=openapi.License(name="BSD License"),
   ),
   public=True,
   permission_classes=[permissions.AllowAny],
)

urlpatterns = [
   re_path(r'^swagger(?P<format>\.json|\.yaml)$', SchemaView.without_ui(cache_timeout=0), name='schema-json'),
   re_path(r'^swagger/$', SchemaView.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
   re_path(r'^redoc/$', SchemaView.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]


urlpatterns += [
    path("api/", include("api.urls")),
    path("admin/", admin.site.urls),
]
