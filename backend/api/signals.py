from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Approvisionnement, MachineBoisson


@receiver(post_save, sender=Approvisionnement)
def update_stock_on_refill(sender, instance, created, **kwargs):
    if created:
        mb = instance.machine_boisson
        mb.stock_restante = mb.stock_restante + instance.quantite
        mb.stock_initial = mb.stock_initial + instance.quantite
        mb.save()