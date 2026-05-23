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

@api_view(['GET', 'POST', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def create_menu_item(request, pk=None):
    
    if request.method == 'GET':
        items = MenuItem.objects.all()
        serializer = PublicMenuItemSerializer(items, many=True)
        return Response(serializer.data)
    
    if request.method == 'POST':
        serializer = MenuItemCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    if request.method == 'PUT':
        item = get_object_or_404(MenuItem, pk=pk)
        serializer = MenuItemCreateSerializer(item, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    if request.method == 'DELETE':
        item = get_object_or_404(MenuItem, pk=pk)
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)