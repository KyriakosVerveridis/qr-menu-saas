from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import MenuItem
from .serializers import PublicMenuItemSerializer

@api_view(['GET'])
def public_menu(request, restaurant_id):
    menu_items = MenuItem.objects.filter(restaurant_id=restaurant_id)
    serializer = PublicMenuItemSerializer(menu_items, many=True)
    return Response(serializer.data)