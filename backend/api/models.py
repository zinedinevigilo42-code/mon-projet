from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.files.storage import FileSystemStorage
from decimal import Decimal
from django.core.validators import MinValueValidator, MaxValueValidator
import os


class User(AbstractUser):
    ROLE_CHOICES = (
        ("admin", "Admin"),
        ("technicien", "Technicien"),
        ("client", "Client"),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="client")

    def __str__(self):
        return f"{self.username} ({self.role})"


class Notification(models.Model):
    TYPE_CHOICES = (
        ('new_boisson', 'Nouvelle Boisson'),
        ('machine_panne', 'Panne Machine'),
        ('machine_reparée', 'Machine Réparée'),
        ('promotion', 'Promotion'),
        ('transaction', 'Transaction'),
        ('panne_resolue', 'Panne Résolue'),
        ('stock_approvisionne', 'Stock Approvisionné'),
        ('system', 'Système'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications", null=True, blank=True)
    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    read = models.BooleanField(default=False)
    related_object_id = models.IntegerField(null=True, blank=True)
    related_object_type = models.CharField(max_length=50, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.notification_type}"


# Configuration pour stocker les images
def boisson_image_path(instance, filename):
    """Génère un chemin pour l'image de la boisson"""
    ext = filename.split('.')[-1]
    # Créer un nom de fichier sécurisé
    safe_name = instance.nom.replace(' ', '_').replace('/', '_')[:50]
    filename = f"boisson_{safe_name}_{instance.id if instance.id else 'temp'}.{ext}"
    return os.path.join('boissons', filename)


class Boisson(models.Model):
    CATEGORY_CHOICES = (
        ('cafe', 'Cafés'),
        ('the', 'Thés'),
        ('jus', 'Jus'),
        ('soda', 'Sodas'),
        ('alcool', 'Boissons alcoolisées'),
        ('autre', 'Autre'),
    )
    
    TEMPERATURE_CHOICES = (
        ('hot', 'Chaud'),
        ('cold', 'Froid'),
        ('both', 'Chaud/Froid'),
    )
    
    nom = models.CharField(max_length=150)
    prix = models.DecimalField(max_digits=8, decimal_places=2)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='boissons/', null=True, blank=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='autre')
    
    on_promotion = models.BooleanField(default=False)
    promotion_percent = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(80)],
        help_text="Pourcentage de réduction (0-80%)"
    )
    prix_promotion = models.DecimalField(
        max_digits=8, 
        decimal_places=2, 
        null=True, 
        blank=True,
        help_text="Prix après réduction"
    )
    
    temperature = models.CharField(
        max_length=10, 
        choices=TEMPERATURE_CHOICES, 
        default='hot'
    )
    preparation_time = models.IntegerField(
        default=5,
        validators=[MinValueValidator(1), MaxValueValidator(30)],
        help_text="Temps de préparation en minutes"
    )
    calories = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        help_text="Nombre de calories"
    )
    
    active = models.BooleanField(default=True)
    popular = models.BooleanField(default=False)
    is_new = models.BooleanField(default=False)
    
    ingredients = models.TextField(
        blank=True,
        default='',
        help_text="Liste des ingrédients séparés par des virgules"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        promotion_tag = f" [PROMO -{self.promotion_percent}%]" if self.on_promotion else ""
        return f"{self.nom} - {self.prix_promotion if self.on_promotion else self.prix} Ar{promotion_tag}"

    @property
    def image_url(self):
        if self.image and hasattr(self.image, 'url'):
            return self.image.url
        return ''

    @property
    def ingredients_list(self):
        if not self.ingredients:
            return []
        return [ing.strip() for ing in self.ingredients.split(',') if ing.strip()]

    def save(self, *args, **kwargs):
        # Calculer le prix promotionnel
        if self.on_promotion and self.promotion_percent > 0:
            percent_decimal = Decimal(self.promotion_percent) / Decimal(100)
            reduction = self.prix * percent_decimal
            self.prix_promotion = self.prix - reduction
        else:
            self.prix_promotion = None
            self.promotion_percent = 0
        
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        # Créer une notification si c'est une nouvelle boisson
        if is_new and self.is_new:
            from django.db import connection
            from django.apps import apps
            
            # Vérifier si la table User existe
            try:
                User = apps.get_model('api', 'User')
                Notification = apps.get_model('api', 'Notification')
                
                clients = User.objects.filter(role='client')
                for client in clients:
                    Notification.objects.create(
                        user=client,
                        title="Nouvelle boisson disponible !",
                        message=f"'{self.nom}' a été ajoutée au menu. Prix: {self.prix} Ar",
                        notification_type='new_boisson',
                        related_object_id=self.id,
                        related_object_type='boisson'
                    )
            except Exception as e:
                print(f"Erreur création notification nouvelle boisson: {e}")

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Boisson"
        verbose_name_plural = "Boissons"


class Machine(models.Model):
    STATUS = (
        ("active", "Active"),
        ("panne", "Panne"),
        ("hors_service", "Hors Service"),
    )
    nom = models.CharField(max_length=150)
    localisation = models.CharField(max_length=255, blank=True)
    status = models.CharField(max_length=20, choices=STATUS, default="active")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.nom} - ({self.localisation})"
    
    def save(self, *args, **kwargs):
        old_status = None
        if self.pk:
            try:
                old_instance = Machine.objects.get(pk=self.pk)
                old_status = old_instance.status
            except Machine.DoesNotExist:
                pass
        
        super().save(*args, **kwargs)
        
        # Créer des notifications pour les changements de statut
        from django.apps import apps
        try:
            User = apps.get_model('api', 'User')
            Notification = apps.get_model('api', 'Notification')
            
            # Si la machine passe en panne
            if old_status != 'panne' and self.status == 'panne':
                clients = User.objects.filter(role='client')
                for client in clients:
                    Notification.objects.create(
                        user=client,
                        title="Machine en panne",
                        message=f"La machine '{self.nom}' ({self.localisation}) est actuellement en panne.",
                        notification_type='machine_panne',
                        related_object_id=self.id,
                        related_object_type='machine'
                    )
            
            # Si la machine est réparée
            elif old_status == 'panne' and self.status == 'active':
                clients = User.objects.filter(role='client')
                for client in clients:
                    Notification.objects.create(
                        user=client,
                        title="Machine réparée",
                        message=f"La machine '{self.nom}' ({self.localisation}) a été réparée et est à nouveau disponible.",
                        notification_type='machine_reparée',
                        related_object_id=self.id,
                        related_object_type='machine'
                    )
        except Exception as e:
            print(f"Erreur création notification machine: {e}")


class MachineBoisson(models.Model):
    machine = models.ForeignKey(Machine, on_delete=models.CASCADE, related_name="stocks")
    boisson = models.ForeignKey(Boisson, on_delete=models.CASCADE, related_name="machine_stocks")
    stock_initial = models.PositiveIntegerField(default=0)
    stock_restante = models.PositiveIntegerField(default=0)
    seuil_rupture = models.PositiveIntegerField(default=5)

    class Meta:
        unique_together = ("machine", "boisson")

    def __str__(self):
        return f"{self.machine.nom} - {self.boisson.nom} : {self.stock_restante}"


class Approvisionnement(models.Model):
    machine_boisson = models.ForeignKey(MachineBoisson, on_delete=models.CASCADE, related_name="approvisionnements")
    quantite = models.PositiveIntegerField()
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.machine_boisson} +{self.quantite} by {self.user}"

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        # Créer une notification pour l'admin
        if is_new:
            from django.apps import apps
            try:
                User = apps.get_model('api', 'User')
                Notification = apps.get_model('api', 'Notification')
                
                admin_users = User.objects.filter(role='admin')
                for admin in admin_users:
                    Notification.objects.create(
                        user=admin,
                        title="Stock Approvisionné",
                        message=f"Le technicien a approvisionné {self.quantite} unités pour {self.machine_boisson.boisson.nom}",
                        notification_type='stock_approvisionne',
                        related_object_id=self.id,
                        related_object_type='approvisionnement'
                    )
            except Exception as e:
                print(f"Erreur création notification approvisionnement: {e}")


class Transaction(models.Model):
    PAYMENT = (
        ('carte', "Carte"),
        ("mobile_money", "Mobile Money"),
        ("cash_simulation", "Cash_SIM"),
    )
    STATUS = (
        ("success", "Success"),
        ("pending", "Pending"),
        ("failed", "Failed"),
    )

    machine = models.ForeignKey(Machine, on_delete=models.SET_NULL, null=True, related_name="transactions")
    boisson = models.ForeignKey(Boisson, on_delete=models.SET_NULL, null=True, related_name="transactions")
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    montant = models.DecimalField(max_digits=8, decimal_places=2)
    moyen_paiement = models.CharField(max_length=30, choices=PAYMENT, default="cash_simulation")
    statut = models.CharField(max_length=20, choices=STATUS, default="pending")
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Tx {self.id} - {self.boisson} on {self.machine} = {self.statut}"
    
    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        # Créer une notification pour l'admin
        if is_new and self.statut == 'success':
            from django.apps import apps
            try:
                User = apps.get_model('api', 'User')
                Notification = apps.get_model('api', 'Notification')
                
                admin_users = User.objects.filter(role='admin')
                for admin in admin_users:
                    Notification.objects.create(
                        user=admin,
                        title="Nouvelle Transaction",
                        message=f"Le client a effectué une transaction de {self.montant} Ar pour {self.boisson.nom if self.boisson else 'une boisson'}",
                        notification_type='transaction',
                        related_object_id=self.id,
                        related_object_type='transaction'
                    )
            except Exception as e:
                print(f"Erreur création notification transaction: {e}")


class Panne(models.Model):
    STATUS = (
        ("non_resolu", "Non résolu"),
        ("resolu", "Résolu"),
    )
    machine = models.ForeignKey(Machine, on_delete=models.CASCADE, related_name="pannes")
    description = models.TextField()
    declared_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS, default="non_resolu")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Panne {self.id} - {self.machine.nom} - {self.status}"
    
    def save(self, *args, **kwargs):
        # Vérifier l'ancien statut
        old_status = None
        if self.pk:
            try:
                old_instance = Panne.objects.get(pk=self.pk)
                old_status = old_instance.status
            except Panne.DoesNotExist:
                pass
        
        super().save(*args, **kwargs)
        
        # Créer une notification si la panne est résolue
        if old_status == 'non_resolu' and self.status == 'resolu':
            from django.apps import apps
            try:
                User = apps.get_model('api', 'User')
                Notification = apps.get_model('api', 'Notification')
                
                admin_users = User.objects.filter(role='admin')
                for admin in admin_users:
                    Notification.objects.create(
                        user=admin,
                        title="Panne Résolue",
                        message=f"Le technicien a résolu la panne #{self.id} sur la machine {self.machine.nom}",
                        notification_type='panne_resolue',
                        related_object_id=self.id,
                        related_object_type='panne'
                    )
            except Exception as e:
                print(f"Erreur création notification panne résolue: {e}")