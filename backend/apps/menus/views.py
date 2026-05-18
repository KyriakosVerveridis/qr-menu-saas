from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from apps.restaurants.models import Restaurant
from apps.menus.models import MenuCategory
from .serializers import PublicMenuItemSerializer


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