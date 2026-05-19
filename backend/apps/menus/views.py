from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from apps.restaurants.models import Restaurant
from apps.menus.models import MenuCategory
from .serializers import MenuItemCreateSerializer, PublicMenuItemSerializer

from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .models import MenuItem


@api_view(['GET'])
def public_menu(request, slug):
    # Safe fetch: returns 404 instead of crashing if restaurant doesn't exist
    restaurant = get_object_or_404(Restaurant, slug=slug)

    # Prefetch items to prevent N+1 database queries
    categories = MenuCategory.objects.filter(
        restaurant=restaurant
    ).prefetch_related("menu_items")

    data = []

    for category in categories:
        # Use our new serializer to handle the JSON fields automatically
        serializer = PublicMenuItemSerializer(category.menu_items.all(), many=True)

        data.append({
            "category": category.name, # Returns the full multilingual JSON object
            "items": serializer.data
        })

    return Response(data)

@api_view(['POST'])
@permission_classes([IsAuthenticated]) # Lock endpoint with JWT
def create_menu_item(request):
    # Use the creation serializer to parse and structure the payload
    serializer = MenuItemCreateSerializer(data=request.data)
    
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)