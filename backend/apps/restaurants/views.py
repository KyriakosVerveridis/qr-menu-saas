from rest_framework import viewsets
from .models import Restaurant
from .serializers import RestaurantSerializer

from rest_framework.permissions import IsAuthenticated
from .services import get_user_restaurants

class RestaurantViewSet(viewsets.ModelViewSet):
    serializer_class = RestaurantSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return get_user_restaurants(self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

