from rest_framework.decorators import api_view
from rest_framework.response import Response
from apps.restaurants.models import Restaurant
from apps.restaurants.models import Restaurant
from apps.menus.models import MenuCategory


@api_view(['GET'])
def public_menu(request, slug):
    restaurant = Restaurant.objects.get(slug=slug)

    categories = MenuCategory.objects.filter(
        restaurant=restaurant
    ).prefetch_related("menu_items")

    data = []

    for category in categories:
        items = []

        for item in category.menu_items.all():
            items.append({
                "id": item.id,
                "name": item.name_GR,
                "price": item.price,
                "image": item.image,
            })

        data.append({
            "category": category.name,
            "items": items
        })

    return Response(data)