from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import PasswordResetRequestView, UserProfileView, RegisterView, PasswordResetConfirmView, VerifyEmailView

urlpatterns = [
    # Endpoints for Login and Token Refresh (from Simple JWT)
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Endpoint for Register
    path('register/', RegisterView.as_view(), name='register'),

    # Endpoint for Reset Password Request-Confirmation
    path('password-reset/', PasswordResetRequestView.as_view(), name='password_reset'),
    path('password-reset-confirm/<str:uidb64>/<str:token>/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),

    #  Endpoint for Email Verification
    path('verify-email/<str:uidb64>/<str:token>/', VerifyEmailView.as_view(), name='verify_email'),

    # Endpoint for Profile
    path('profile/', UserProfileView.as_view(), name='user_profile'),
]