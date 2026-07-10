from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from apps.restaurants.models import Restaurant
from apps.menus.models import MenuItem
from .serializers import MenuItemCreateSerializer, PublicMenuItemSerializer

from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from apps.categories.models import Category


@api_view(['GET'])
def public_menu(request, slug):
    # 1. Βρες το εστιατόριο
    restaurant = get_object_or_404(Restaurant, slug=slug)

    # 2. Φιλτράρισε τα MenuItem απευθείας με το restaurant
    # Έτσι διασφαλίζεις ότι δεν θα δεις προϊόντα άλλου καταστήματος
    items = MenuItem.objects.filter(restaurant=restaurant).select_related('category')

    # 3. Οργάνωση δεδομένων (πιο καθαρά)
    data = []
    for item in items:
        serializer = PublicMenuItemSerializer(item)
        item_data = serializer.data
        # Χρησιμοποίησε το όνομα της κατηγορίας που ανήκει το συγκεκριμένο item
        item_data['category'] = item.category.master_category.name if item.category else "Uncategorized"
        data.append(item_data)

    return Response(data)

@api_view(['GET', 'POST', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def create_menu_item(request, pk=None):
    
    restaurant_id = request.query_params.get('restaurant')
    
    if restaurant_id:
        user_restaurant = get_object_or_404(request.user.restaurants, id=restaurant_id)
    else:
        user_restaurant = request.user.restaurants.first()

    if not user_restaurant:
        return Response({"error": "User has no restaurant assigned"}, status=status.HTTP_400_BAD_REQUEST)

    # 1. GET: Φέρνει τα προϊόντα ΜΟΝΟ για το επιλεγμένο κατάστημα
    if request.method == 'GET':
        items = MenuItem.objects.filter(restaurant=user_restaurant)
        serializer = PublicMenuItemSerializer(items, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    # 2. POST: Δημιουργία προϊόντος στο σωστό κατάστημα
    if request.method == 'POST':
        serializer = MenuItemCreateSerializer(data=request.data)
        if serializer.is_valid():
            category = serializer.validated_data['category']
            
            # Έλεγχος ασφαλείας:
            if category.restaurant != user_restaurant:
                return Response({"error": "Invalid category for this restaurant"}, status=400)
            
            serializer.save(restaurant=user_restaurant)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # 3. PUT: Ενημέρωση προϊόντος
    if request.method == 'PUT':
        item = get_object_or_404(MenuItem, pk=pk, restaurant=user_restaurant)
        serializer = MenuItemCreateSerializer(item, data=request.data, partial=True)
        if serializer.is_valid():
            category = serializer.validated_data.get('category')
            if category and category.restaurant != user_restaurant:
                return Response({"error": "Invalid category for this restaurant"}, status=400)
            serializer.save()

            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # 4. DELETE: Διαγραφή
    if request.method == 'DELETE':
        item = get_object_or_404(MenuItem, pk=pk, restaurant=user_restaurant)
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    