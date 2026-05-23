from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import NotFound
from .models import Profile
from .serializers import ProfileSerializer

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