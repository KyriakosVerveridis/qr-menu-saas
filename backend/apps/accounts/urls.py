from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import UserProfileView

urlpatterns = [
    # Endpoints for Login and Token Refresh (from Simple JWT)
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Endpoint for Profile
    path('profile/', UserProfileView.as_view(), name='user_profile'),
]