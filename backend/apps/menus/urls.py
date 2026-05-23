from django.urls import path
from .views import public_menu, create_menu_item

urlpatterns = [
    path("public/<slug:slug>/", public_menu),
    path("items/", create_menu_item, name="create_menu_item"),
    path("items/<int:pk>/", create_menu_item, name="menu_item_detail"),
]