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
from rest_framework import serializers


@api_view(['GET'])
def public_menu(request, slug):
    from apps.categories.serializers import MasterCategorySerializer
    from apps.billing.models import Subscription

    restaurant = get_object_or_404(Restaurant, slug=slug)

    first_restaurant = Restaurant.objects.filter(owner=restaurant.owner).order_by('created_at').first()
    is_first_restaurant = (restaurant.id == first_restaurant.id)

    if not is_first_restaurant:
        has_active_subscription = Subscription.objects.filter(restaurant=restaurant, status='active').exists()
        if not has_active_subscription:
            return Response({"error": "This menu is not yet active."}, status=status.HTTP_402_PAYMENT_REQUIRED)

    items = (
        MenuItem.objects.filter(restaurant=restaurant)
        .select_related('category__master_category')
        .prefetch_related('category__master_category__translations', 'translations')
    )

    groups = {}
    for item in items:
        master_category = item.category.master_category
        if master_category.id not in groups:
            groups[master_category.id] = {
                'category': MasterCategorySerializer(master_category).data,
                'items': [],
            }
        groups[master_category.id]['items'].append(PublicMenuItemSerializer(item).data)

    return Response(list(groups.values()))

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
        serializer = MenuItemCreateSerializer(items, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

        # 2. POST: Δημιουργία προϊόντος στο σωστό κατάστημα
    if request.method == 'POST':
        serializer = MenuItemCreateSerializer(data=request.data, context={'restaurant': user_restaurant})
        if serializer.is_valid():
            category = serializer.validated_data['category']

            if category.restaurant != user_restaurant:
                return Response({"error": "Invalid category for this restaurant"}, status=400)

            try:
                serializer.save(restaurant=user_restaurant)
            except serializers.ValidationError as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


    # 3. PUT: Ενημέρωση προϊόντος
    if request.method == 'PUT':
        item = get_object_or_404(MenuItem, pk=pk, restaurant=user_restaurant)
        serializer = MenuItemCreateSerializer(item, data=request.data, partial=True, context={'restaurant': user_restaurant})
        if serializer.is_valid():
            category = serializer.validated_data.get('category')
            if category and category.restaurant != user_restaurant:
                return Response({"error": "Invalid category for this restaurant"}, status=400)
            try:
                serializer.save()
            except serializers.ValidationError as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # 4. DELETE: Διαγραφή
    if request.method == 'DELETE':
        item = get_object_or_404(MenuItem, pk=pk, restaurant=user_restaurant)
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)