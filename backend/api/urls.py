from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import (
    UserViewSet,NotificationViewSet, UserNotificationsView, CreateNotificationForNewBoisson,
    CreateNotificationForMachinePanne, BoissonViewSet, MachineViewSet,
    MachineBoissonViewSet, ApprovisionnementViewSet,
    TransactionViewSet, PanneViewSet
)
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

router = DefaultRouter()
router.register(r"users", UserViewSet)
router.register(r"boissons", BoissonViewSet)
router.register(r"machines", MachineViewSet)
router.register(r"machine-stocks", MachineBoissonViewSet)
router.register(r"approvisionnements", ApprovisionnementViewSet)
router.register(r"transactions", TransactionViewSet)
router.register(r"pannes", PanneViewSet)
router.register(r'notifications', NotificationViewSet, basename='notification')


urlpatterns = [
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path("", include(router.urls)),
    path('notifications/user/', UserNotificationsView.as_view(), name='user-notifications'),
    path('notifications/new-boisson/', CreateNotificationForNewBoisson.as_view(), name='notify-new-boisson'),
    path('notifications/machine-panne/', CreateNotificationForMachinePanne.as_view(), name='notify-machine-panne'),
    
]