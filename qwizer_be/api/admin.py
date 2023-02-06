import os
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import Group
from django.contrib.auth.hashers import make_password
from django.forms import ValidationError
from import_export.admin import ImportExportModelAdmin
from import_export import resources

# Register your models here.
from .models import (
    Asignatura,
    Imparte,
    Intento,
    # Cuestionarios,
    # EsAlumno,
    # Notas,
    # OpcionesTest,
    # PerteneceACuestionario,
    # Preguntas,
    # RespuestasTest,
    # RespuestasTexto,
    User,
)


class UserResource(resources.ModelResource):
    class Meta:
        model = User
        skip_unchanged = True
        report_skipped = True
        import_id_fields = ("email",)
        fields = ("email", "first_name", "last_name", "password", "role")
        export_order = ("email", "first_name", "last_name", "password", "role")

    def before_import_row(self, row, row_number=None, **kwargs):
        if not row["password"].strip():
            raise ValidationError("Password cannot be blank")
        # TODO salt temporal hasta que se implemente una contraseña temporal?
        row["password"] = make_password(
            row["password"], salt=os.environ.get("SECRET_KEY", "salt")[-10:]
        )


# TODO formulario muy basico revisar
class UserAdmin(BaseUserAdmin, ImportExportModelAdmin):
    # ImportExportModelAdmin
    resource_class = UserResource

    # BaseUserAdmin
    # The fields to be used in displaying the User model.
    # These override the definitions on the base UserAdmin
    # that reference specific fields on auth.User.
    readonly_fields = (
        "date_joined",
        "last_login",
    )
    list_display = ["email", "role"]
    list_filter = ["role"]
    fieldsets = (
        (None, {"fields": ("email", "password", "role")}),
        ("Dates", {"fields": ("date_joined", "last_login")}),
        (
            "Permissions",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                )
            },
        ),
    )
    # add_fieldsets is not a standard ModelAdmin attribute. UserAdmin
    # overrides get_fieldsets to use this attribute when creating a user.
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("email", "first_name", "last_name" ,"password1", "password2", "role"),
            },
        ),
    )
    search_fields = ["email", "role"]
    ordering = ["email"]
    filter_horizontal = ()


class ImparteAdmin(admin.ModelAdmin):
    list_display = ('profesor','asignatura')

class IntentoAdmin(admin.ModelAdmin):
    list_display = ('usuario','cuestionario','nota','estado')

admin.site.register(User, UserAdmin)
admin.site.register(Asignatura)    # TODO no hay otra manera de crear asignaturas!!!
admin.site.register(Imparte,ImparteAdmin)
admin.site.register(Intento, IntentoAdmin)


admin.site.unregister(Group)
