from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from apps.restaurants.models import Restaurant
from apps.menus.models import MenuItem, MenuItemTranslation
from .serializers import MenuItemCreateSerializer, PublicMenuItemSerializer

from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from apps.categories.models import Category
import deepl
from apps.languages.models import Language
from apps.billing.models import Subscription
from django.conf import settings
from rest_framework import serializers
from rest_framework.views import APIView


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

    category_order = {}
    for cat in Category.objects.filter(restaurant=restaurant):
        category_order[cat.master_category_id] = cat.order

    groups = {}
    for item in items:
        master_category = item.category.master_category
        if master_category.id not in groups:
            groups[master_category.id] = {
                'category': MasterCategorySerializer(master_category).data,
                'items': [],
            }
        groups[master_category.id]['items'].append(PublicMenuItemSerializer(item).data)

    sorted_groups = sorted(groups.values(), key=lambda g: category_order.get(g['category']['id'], 0))

    return Response(sorted_groups)

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


class TranslateMenuView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        restaurant_id = request.data.get('restaurant_id')
        target_language = request.data.get('target_language')

        if not restaurant_id or not target_language:
            return Response({"error": "restaurant_id and target_language are required"}, status=status.HTTP_400_BAD_REQUEST)

        restaurant = Restaurant.objects.filter(id=restaurant_id, owner=request.user).first()
        if not restaurant:
            return Response({"error": "Restaurant not found"}, status=status.HTTP_404_NOT_FOUND)

        has_premium = Subscription.objects.filter(restaurant=restaurant, status='active').exists()
        if target_language != 'en' and not has_premium:
            return Response({"error": "Αυτή η γλώσσα απαιτεί ενεργή συνδρομή Premium."}, status=status.HTTP_400_BAD_REQUEST)

        language = Language.objects.filter(code=target_language).first()
        if not language:
            return Response({"error": "Language not found"}, status=status.HTTP_404_NOT_FOUND)

        translator = deepl.Translator(settings.DEEPL_API_KEY)
        deepl_lang_map = {
            'en': 'EN-GB',
            'de': 'DE',
            'fr': 'FR',
            'es': 'ES',
            'it': 'IT',
            'ru': 'RU',
            'bg': 'BG',
            'ro': 'RO',
            'tr': 'TR',
        }
        deepl_target = deepl_lang_map.get(target_language, target_language.upper())

        items = MenuItem.objects.filter(restaurant=restaurant).prefetch_related('translations')
        translated_count = 0

        for item in items:
            greek_translation = item.translations.filter(language__code='el').first()
            if not greek_translation:
                continue

            translated_name = translator.translate_text(greek_translation.name, target_lang=deepl_target).text
            translated_description = translator.translate_text(greek_translation.description, target_lang=deepl_target).text if greek_translation.description else ''

            MenuItemTranslation.objects.update_or_create(
                menu_item=item,
                language=language,
                defaults={'name': translated_name, 'description': translated_description},
            )
            translated_count += 1

        from apps.categories.models import MasterCategory, MasterCategoryTranslation

        master_categories = MasterCategory.objects.filter(
            id__in=Category.objects.filter(restaurant=restaurant).values_list('master_category_id', flat=True)
        ).prefetch_related('translations')

        for master_category in master_categories:
            already_translated = master_category.translations.filter(language__code=target_language).exists()
            if already_translated:
                continue

            greek_cat_translation = master_category.translations.filter(language__code='el').first()
            if not greek_cat_translation:
                continue

            translated_cat_name = translator.translate_text(greek_cat_translation.name, target_lang=deepl_target).text

            MasterCategoryTranslation.objects.update_or_create(
                master_category=master_category,
                language=language,
                defaults={'name': translated_cat_name},
            )

        return Response({"message": f"Μεταφράστηκαν {translated_count} προϊόντα."}, status=status.HTTP_200_OK)

class ReorderMenuItemsView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        item_ids = request.data.get('item_ids', [])

        for index, item_id in enumerate(item_ids):
            MenuItem.objects.filter(id=item_id, restaurant__owner=request.user).update(order=index)

        return Response({"message": "Η σειρά ενημερώθηκε."}, status=status.HTTP_200_OK)    