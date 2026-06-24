from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.exceptions import NotFound
from .models import Profile
from .serializers import ProfileSerializer, RegisterSerializer

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
            serializer.save()
            return Response({"message": "User registered successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)        