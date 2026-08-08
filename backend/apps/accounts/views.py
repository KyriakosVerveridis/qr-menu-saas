from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.exceptions import NotFound
from .models import Profile
from .serializers import ProfileSerializer, RegisterSerializer, User
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.contrib.auth import get_user_model
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.conf import settings
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from .tokens import email_verification_token
from rest_framework_simplejwt.views import TokenObtainPairView

User = get_user_model()

class UserProfileView(generics.RetrieveAPIView):
    """
    View to retrieve the authenticated user's profile
    """
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        try:
            # Safely return the profile of the logged-in user
            return self.request.user.profile
        except Profile.DoesNotExist:
            # Avoid 500 error if profile missing, return a clean 404 instead
            raise NotFound("Profile not found for this user.")
        
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()

            token = email_verification_token.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            verify_link = f"{settings.FRONTEND_URL}/verify-email/{uid}/{token}/"

            message = Mail(
                from_email=settings.DEFAULT_FROM_EMAIL,
                to_emails=user.email,
                subject="Επιβεβαίωση Email - QR Menu",
                plain_text_content=f"Καλωσήρθες! Πατήστε τον παρακάτω σύνδεσμο για να επιβεβαιώσετε το email σας:\n\n{verify_link}",
            )
            sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
            sg.send(message)
            
            return Response({"message": "User registered successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(email=email).first()
        if user:
            token_generator = PasswordResetTokenGenerator()
            token = token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            reset_link = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}/"

            message = Mail(
                from_email=settings.DEFAULT_FROM_EMAIL,
                to_emails=user.email,
                subject="Επαναφορά Κωδικού - QR Menu",
                plain_text_content=f"Πατήστε τον παρακάτω σύνδεσμο για να επαναφέρετε τον κωδικό σας:\n\n{reset_link}",
            )
            sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
            sg.send(message)

        return Response(
            {"message": "Αν το email υπάρχει στο σύστημά μας, θα λάβετε σύνδεσμο επαναφοράς."},
            status=status.HTTP_200_OK
        )

class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        if user is not None and PasswordResetTokenGenerator().check_token(user, token):
            new_password = request.data.get('new_password')
            if not new_password:
                return Response({"error": "New password is required"}, status=status.HTTP_400_BAD_REQUEST)

            user.set_password(new_password)
            user.save()
            return Response({"message": "Password has been reset successfully."}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Invalid token or user ID."}, status=status.HTTP_400_BAD_REQUEST)

class VerifyEmailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        if user is not None and email_verification_token.check_token(user, token):
            user.profile.is_email_verified = True
            user.profile.save()
            return Response({"message": "Το email επιβεβαιώθηκε επιτυχώς."}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Ο σύνδεσμος δεν είναι έγκυρος ή έχει λήξει."}, status=status.HTTP_400_BAD_REQUEST)

class ResendVerificationEmailView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(email=email).first()
        if user and not user.profile.is_email_verified:
            token = email_verification_token.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            verify_link = f"{settings.FRONTEND_URL}/verify-email/{uid}/{token}/"

            message = Mail(
                from_email=settings.DEFAULT_FROM_EMAIL,
                to_emails=user.email,
                subject="Επιβεβαίωση Email - QR Menu",
                plain_text_content=f"Πατήστε τον παρακάτω σύνδεσμο για να επιβεβαιώσετε το email σας:\n\n{verify_link}",
            )
            sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
            sg.send(message)

        return Response(
            {"message": "Αν το email υπάρχει και δεν έχει επιβεβαιωθεί, θα λάβετε νέο σύνδεσμο."},
            status=status.HTTP_200_OK
        )

class VerifiedTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)

        if response.status_code == 200:
            username = request.data.get('username')
            user = User.objects.filter(username=username).first()

            if user and not user.profile.is_email_verified:
                return Response(
                    {"error": "Παρακαλώ επιβεβαιώστε το email σας πριν συνδεθείτε."},
                    status=status.HTTP_403_FORBIDDEN
                )

        return response        