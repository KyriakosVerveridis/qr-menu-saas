from django.urls import path
from .views import public_menu, create_menu_item

urlpatterns = [
    path("public/<slug:slug>/", public_menu),
    path("items/", create_menu_item, name="create_menu_item"),
]