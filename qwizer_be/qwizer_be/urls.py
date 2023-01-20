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
from drf_spectacular.views import SpectacularJSONAPIView, SpectacularRedocView, SpectacularSwaggerView, SpectacularYAMLAPIView


# TODO Swagger sirve para autodocumentar la api accediendo a /swagger
# ademas de poder exportarlo a postman y poder probar la api facilmente
# en producción deberia quitarse

urlpatterns = [
    # YOUR PATTERNS
    path('swagger.json', SpectacularJSONAPIView.as_view(), name='schema-swagger-json'),
    path('swagger.yml', SpectacularYAMLAPIView.as_view(), name='schema-swagger-yml'),

    # Optional UI:
    path('swagger/', SpectacularSwaggerView.as_view(url_name='schema-swagger-json'), name='swagger-ui'),
    path('redoc/', SpectacularRedocView.as_view(url_name='schema-swagger-json'), name='redoc'),

]

urlpatterns += [
    path("api/", include("api.urls")),
    path("admin/", admin.site.urls),
]
# TODO falta favicon
