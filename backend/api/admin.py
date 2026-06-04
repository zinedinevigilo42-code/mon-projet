from django.contrib import admin
from .models import User, Boisson, Machine, MachineBoisson, Approvisionnement, Transaction, Panne
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    fieldsets = BaseUserAdmin.fieldsets + (("Role", {"fields": ("role",)}),)


admin.site.register(Boisson)
admin.site.register(Machine)
admin.site.register(MachineBoisson)
admin.site.register(Approvisionnement)
admin.site.register(Transaction)
admin.site.register(Panne)
