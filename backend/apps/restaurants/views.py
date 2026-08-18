import io
import qrcode
from django.conf import settings
from django.http import HttpResponse
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from .models import Restaurant
from .serializers import RestaurantSerializer
from .permissions import IsOwner
from .services import get_user_restaurants
from apps.billing.models import Subscription
from rest_framework.response import Response
from rest_framework import status


class RestaurantViewSet(viewsets.ModelViewSet):
    serializer_class = RestaurantSerializer
    permission_classes = [IsAuthenticated, IsOwner]

    def get_queryset(self):
        return get_user_restaurants(self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def destroy(self, request, *args, **kwargs):
        restaurant = self.get_object()
    
        has_active_subscription = Subscription.objects.filter(restaurant=restaurant, status='active').exists()
        if has_active_subscription:
            return Response(
                {"error": "Δεν μπορείτε να διαγράψετε κατάστημα με ενεργή συνδρομή. Ακυρώστε πρώτα τη συνδρομή."},
                status=status.HTTP_400_BAD_REQUEST
            )
    
        return super().destroy(request, *args, **kwargs)    

    @action(detail=True, methods=['get'], url_path='qr-code')
    def qr_code(self, request, pk=None):
        restaurant = self.get_object()
        menu_url = f"{settings.FRONTEND_URL}/menu/{restaurant.slug}"

        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_M,
            box_size=10,
            border=4,
        )
        qr.add_data(menu_url)
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")

        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        buffer.seek(0)

        return HttpResponse(buffer, content_type='image/png')

    