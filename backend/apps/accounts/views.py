from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Profile
from .serializers import ProfileSerializer

class UserProfileView(generics.RetrieveAPIView):
    """
    View to retrieve the authenticated user's profile
    """
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        # Automatically returns the profile of the logged-in user
        return self.request.user.profile