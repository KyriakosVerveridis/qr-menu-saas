from rest_framework.decorators import api_view
from rest_framework.response import Response
from apps.restaurants.models import Restaurant
from .models import MenuItem
from .serializers import PublicMenuItemSerializer

@api_view(['GET'])
def public_menu(request, slug):
    restaurant = Restaurant.objects.get(slug=slug)
    menu_items = MenuItem.objects.filter(restaurant=restaurant)

    serializer = PublicMenuItemSerializer(menu_items, many=True)
    return Response(serializer.data)