from rest_framework import serializers
from .models import User,Notification, Boisson, Machine, MachineBoisson, Approvisionnement, Transaction, Panne
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ("id", "username", "email", "password", "first_name", "last_name", "role")
        extra_kwargs = {
            'email': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
        }

    def validate_username(self, value):
        """Valider l'unicité du username"""
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Ce nom d'utilisateur est déjà utilisé")
        return value

    def validate_email(self, value):
        """Valider l'unicité de l'email"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Cet email est déjà utilisé")
        return value

    def validate_password(self, value):
        """Valider la force du mot de passe"""
        try:
            validate_password(value)
        except ValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value

    def create(self, validated_data):
        """Créer un utilisateur avec mot de passe hashé"""
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)  
        user.save()
        return user
    
    def update(self, instance, validated_data):
        """Mettre à jour un utilisateur"""
        password = validated_data.pop("password", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        if password:
            instance.set_password(password)  
        
        instance.save()
        return instance

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ('created_at',)

class BoissonSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Boisson
        fields = '__all__'
        read_only_fields = ('created_at',)
    
    def get_image_url(self, obj):
        if obj.image:
            # Construire l'URL complète
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return ''
    
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if 'ingredients' in representation and representation['ingredients']:
            representation['ingredients'] = [ing.strip() for ing in representation['ingredients'].split(',') if ing.strip()]
        else:
            representation['ingredients'] = []
        return representation
    
    def to_internal_value(self, data):
        if 'ingredients' in data and isinstance(data['ingredients'], list):
            data['ingredients'] = ','.join([str(ing).strip() for ing in data['ingredients'] if str(ing).strip()])
        return super().to_internal_value(data)

class MachineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Machine
        fields = "__all__"


class MachineBoissonSerializer(serializers.ModelSerializer):
    boisson = BoissonSerializer(read_only=True)
    boisson_id = serializers.PrimaryKeyRelatedField(queryset=Boisson.objects.all(), source="boisson", write_only=True)


    class Meta:
        model = MachineBoisson
        fields = ("id", "machine", "boisson", "boisson_id", "stock_initial", "stock_restante", "seuil_rupture")


class ApprovisionnementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Approvisionnement
        fields = "__all__"
        read_only_fields = ("date",)


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = "__all__"
        read_only_fields = ("date",)

class PanneSerializer(serializers.ModelSerializer):
    class Meta:
        model = Panne
        fields = "__all__"
        read_only_fields = ("created_at",)