from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.db.models import Sum, Count, Q, F
from .models import User,Notification, Boisson, Machine, MachineBoisson, Approvisionnement, Transaction, Panne
from .serializers import (
    UserSerializer,NotificationSerializer, BoissonSerializer, MachineSerializer,
    MachineBoissonSerializer, ApprovisionnementSerializer,
    TransactionSerializer, PanneSerializer
)
from rest_framework.views import APIView
from django.utils import timezone
from datetime import timedelta


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
       
        if self.action in ['create', 'login']:
            return [AllowAny()]
        return [IsAuthenticated()]

    def create(self, request, *args, **kwargs):
       
        print("🔵 Création d'utilisateur - Action:", self.action)
        print("🔵 Permissions:", [type(p).__name__ for p in self.get_permissions()])
        
        serializer = self.get_serializer(data=request.data)
        
        try:
            serializer.is_valid(raise_exception=True)
            user = serializer.save()
            
            return Response(
                {
                    'message': 'Utilisateur créé avec succès',
                    'user': UserSerializer(user).data
                },
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            print("❌ Erreur:", str(e))
            if hasattr(e, 'detail'):
                return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)
            
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def login(self, request):
        """POST /api/users/login/"""
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response(
                {'error': 'Username et password requis'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = authenticate(username=username, password=password)

        if user is None:
            return Response(
                {'error': 'Identifiants incorrects'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        refresh = RefreshToken.for_user(user)

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data
        })

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        """GET /api/users/me/"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Retourner uniquement les notifications de l'utilisateur connecté
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def unread(self, request):
        notifications = self.get_queryset().filter(read=False)
        serializer = self.get_serializer(notifications, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'])
    def mark_as_read(self, request, pk=None):
        notification = self.get_object()
        notification.read = True
        notification.save()
        return Response({'status': 'notification marked as read'})

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        self.get_queryset().filter(read=False).update(read=True)
        return Response({'status': 'all notifications marked as read'})
class UserNotificationsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Récupérer les notifications de l'utilisateur
        notifications = Notification.objects.filter(user=request.user).order_by('-created_at')
        
        # Récupérer les nouvelles boissons (créées dans les 7 derniers jours)
        week_ago = timezone.now() - timedelta(days=7)
        new_boissons = Boisson.objects.filter(
            created_at__gte=week_ago,
            is_new=True,
            active=True
        )
        
        # Récupérer les machines en panne
        machines_with_pannes = Machine.objects.filter(status='panne')
        
        data = {
            'notifications': NotificationSerializer(notifications, many=True).data,
            'new_boissons_count': new_boissons.count(),
            'machines_with_pannes_count': machines_with_pannes.count(),
            'new_boissons': BoissonSerializer(new_boissons, many=True).data,
            'machines_with_pannes': MachineSerializer(machines_with_pannes, many=True).data
        }
        
        return Response(data)

class CreateNotificationForNewBoisson(APIView):
    permission_classes = [permissions.IsAdminUser]
    
    def post(self, request):
        boisson_id = request.data.get('boisson_id')
        try:
            boisson = Boisson.objects.get(id=boisson_id)
            
            # Créer des notifications pour tous les clients
            clients = User.objects.filter(role='client')
            notifications_created = 0
            
            for client in clients:
                Notification.objects.create(
                    user=client,
                    title="Nouvelle boisson disponible !",
                    message=f"'{boisson.nom}' a été ajoutée au menu. Prix: {boisson.prix} Ar",
                    notification_type='new_boisson',
                    related_object_id=boisson.id,
                    related_object_type='boisson'
                )
                notifications_created += 1
            
            return Response({
                'status': 'success',
                'message': f'Notifications créées pour {notifications_created} clients',
                'boisson': boisson.nom
            })
            
        except Boisson.DoesNotExist:
            return Response(
                {'error': 'Boisson non trouvée'},
                status=status.HTTP_404_NOT_FOUND
            )

class CreateNotificationForMachinePanne(APIView):
    permission_classes = [permissions.IsAdminUser]
    
    def post(self, request):
        machine_id = request.data.get('machine_id')
        try:
            machine = Machine.objects.get(id=machine_id)
            
            # Créer des notifications pour tous les clients
            clients = User.objects.filter(role='client')
            notifications_created = 0
            
            for client in clients:
                Notification.objects.create(
                    user=client,
                    title="Machine en panne",
                    message=f"La machine '{machine.nom}' ({machine.localisation}) est actuellement en panne.",
                    notification_type='machine_panne',
                    related_object_id=machine.id,
                    related_object_type='machine'
                )
                notifications_created += 1
            
            return Response({
                'status': 'success',
                'message': f'Notifications créées pour {notifications_created} clients',
                'machine': machine.nom
            })
            
        except Machine.DoesNotExist:
            return Response(
                {'error': 'Machine non trouvée'},
                status=status.HTTP_404_NOT_FOUND
            )

class BoissonViewSet(viewsets.ModelViewSet):
    queryset = Boisson.objects.all()
    serializer_class = BoissonSerializer
    permission_classes = [IsAuthenticated]
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def get_queryset(self):
        queryset = Boisson.objects.all()
        active = self.request.query_params.get('active', None)
        popular = self.request.query_params.get('popular', None)
        category = self.request.query_params.get('category', None)
        
        if active is not None:
            queryset = queryset.filter(active=active.lower() == 'true')
        if popular is not None:
            queryset = queryset.filter(popular=popular.lower() == 'true')
        if category is not None:
            queryset = queryset.filter(category=category)
        
        return queryset.order_by('-created_at')
    
    def create(self, request, *args, **kwargs):
        if request.user.role != 'admin':
            return Response(
                {"error": "Seuls les administrateurs peuvent créer des boissons"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    def update(self, request, *args, **kwargs):
        if request.user.role != 'admin':
            return Response(
                {"error": "Seuls les administrateurs peuvent modifier des boissons"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        if getattr(instance, '_prefetched_objects_cache', None):
            instance._prefetched_objects_cache = {}
            
        return Response(serializer.data)
    
    def destroy(self, request, *args, **kwargs):
        if request.user.role != 'admin':
            return Response(
                {"error": "Seuls les administrateurs peuvent supprimer des boissons"},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)


class MachineViewSet(viewsets.ModelViewSet):
    queryset = Machine.objects.all()
    serializer_class = MachineSerializer
    
    def get_permissions(self):
        
        return [IsAuthenticated()]

    def get_queryset(self):
        queryset = Machine.objects.all()
        status_param = self.request.query_params.get('status', None)
        if status_param:
            queryset = queryset.filter(status=status_param)
        return queryset.order_by('-created_at')

    @action(detail=True, methods=['get'])
    def stocks(self, request, pk=None):
        machine = self.get_object()
        stocks = MachineBoisson.objects.filter(machine=machine)
        serializer = MachineBoissonSerializer(stocks, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        machine = self.get_object()
        
        stats = {
            'machine': MachineSerializer(machine).data,
            'total_transactions': Transaction.objects.filter(machine=machine).count(),
            'transactions_success': Transaction.objects.filter(
                machine=machine, 
                statut='success'
            ).count(),
            'revenus_total': Transaction.objects.filter(
                machine=machine, 
                statut='success'
            ).aggregate(total=Sum('montant'))['total'] or 0,
            'pannes_actives': Panne.objects.filter(
                machine=machine, 
                status='non_resolu'
            ).count(),
            'stocks': MachineBoissonSerializer(
                MachineBoisson.objects.filter(machine=machine),
                many=True
            ).data
        }
        
        return Response(stats)

    def perform_create(self, serializer):
        if self.request.user.role not in ['admin', 'technicien']:
            raise PermissionError("Permission refusée")
        serializer.save()

    def perform_update(self, serializer):
        if self.request.user.role not in ['admin', 'technicien']:
            raise PermissionError("Permission refusée")
        serializer.save()


class MachineBoissonViewSet(viewsets.ModelViewSet):
    queryset = MachineBoisson.objects.all()
    serializer_class = MachineBoissonSerializer
    
    def get_permissions(self):

        return [IsAuthenticated()]

    def get_queryset(self):
        queryset = MachineBoisson.objects.select_related('machine', 'boisson')
        
        machine_id = self.request.query_params.get('machine', None)
        if machine_id:
            queryset = queryset.filter(machine_id=machine_id)
        
        boisson_id = self.request.query_params.get('boisson', None)
        if boisson_id:
            queryset = queryset.filter(boisson_id=boisson_id)
        
        low_stock = self.request.query_params.get('low_stock', None)
        if low_stock:
            queryset = queryset.filter(stock_restante__lte=F('seuil_rupture'))
        
        return queryset

    def perform_create(self, serializer):
        if self.request.user.role not in ['admin', 'technicien']:
            raise PermissionError("Permission refusée")
        serializer.save()

    def perform_update(self, serializer):
        if self.request.user.role not in ['admin', 'technicien']:
            raise PermissionError("Permission refusée")
        serializer.save()


class ApprovisionnementViewSet(viewsets.ModelViewSet):
    queryset = Approvisionnement.objects.all()
    serializer_class = ApprovisionnementSerializer
    
    def get_permissions(self):
        """Authentification requise pour toutes les actions"""
        return [IsAuthenticated()]

    def get_queryset(self):
        queryset = Approvisionnement.objects.select_related(
            'machine_boisson__machine', 
            'machine_boisson__boisson',
            'user'
        )
        
        machine_id = self.request.query_params.get('machine', None)
        if machine_id:
            queryset = queryset.filter(machine_boisson__machine_id=machine_id)
        
        return queryset.order_by('-date')

    def perform_create(self, serializer):
        if self.request.user.role not in ['admin', 'technicien']:
            raise PermissionError("Permission refusée")
        
        approvisionnement = serializer.save(user=self.request.user)
        
        machine_boisson = approvisionnement.machine_boisson
        machine_boisson.stock_restante += approvisionnement.quantite
        machine_boisson.save()


class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    
    def get_permissions(self):
    
        return [IsAuthenticated()]

    def get_queryset(self):
        queryset = Transaction.objects.select_related('machine', 'boisson', 'user')
        
        user_id = self.request.query_params.get('user_id', None)
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        
        machine_id = self.request.query_params.get('machine', None)
        if machine_id:
            queryset = queryset.filter(machine_id=machine_id)
        
        statut = self.request.query_params.get('statut', None)
        if statut:
            queryset = queryset.filter(statut=statut)
        
        moyen = self.request.query_params.get('moyen_paiement', None)
        if moyen:
            queryset = queryset.filter(moyen_paiement=moyen)
        
        if self.request.user.role == 'client':
            queryset = queryset.filter(user=self.request.user)
        
        return queryset.order_by('-date')

    def perform_create(self, serializer):
        transaction = serializer.save(user=self.request.user)
        
        if transaction.statut == 'success':
            try:
                machine_boisson = MachineBoisson.objects.get(
                    machine=transaction.machine,
                    boisson=transaction.boisson
                )
                
                if machine_boisson.stock_restante > 0:
                    machine_boisson.stock_restante -= 1
                    machine_boisson.save()
                else:
                    transaction.statut = 'failed'
                    transaction.save()
            except MachineBoisson.DoesNotExist:
                transaction.statut = 'failed'
                transaction.save()

    def perform_update(self, serializer):
        if self.request.user.role != 'admin':
            raise PermissionError("Seuls les administrateurs peuvent modifier des transactions")
        serializer.save()


class PanneViewSet(viewsets.ModelViewSet):
    queryset = Panne.objects.all()
    serializer_class = PanneSerializer
    
    def get_permissions(self):
        return [IsAuthenticated()]

    def get_queryset(self):
        queryset = Panne.objects.select_related('machine', 'declared_by')
        
        machine_id = self.request.query_params.get('machine', None)
        if machine_id:
            queryset = queryset.filter(machine_id=machine_id)
        
        status_param = self.request.query_params.get('status', None)
        if status_param:
            queryset = queryset.filter(status=status_param)
        
        return queryset.order_by('-created_at')

    def perform_create(self, serializer):
        panne = serializer.save(declared_by=self.request.user)
        
        machine = panne.machine
        if machine.status != 'panne':
            machine.status = 'panne'
            machine.save()

    def perform_update(self, serializer):
        if self.request.user.role not in ['admin', 'technicien']:
            raise PermissionError("Permission refusée")
        
        panne = serializer.save()
        
        if panne.status == 'resolu':
            pannes_actives = Panne.objects.filter(
                machine=panne.machine,
                status='non_resolu'
            ).count()
            
            if pannes_actives == 0:
                machine = panne.machine
                machine.status = 'active'
                machine.save()