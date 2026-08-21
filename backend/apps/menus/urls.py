from django.urls import path
from .views import ReorderMenuItemsView, public_menu, create_menu_item, TranslateMenuView

urlpatterns = [
    path("public/<slug:slug>/", public_menu),
    path("items/", create_menu_item, name="create_menu_item"),
    path("items/<int:pk>/", create_menu_item, name="menu_item_detail"),
    path("translate/", TranslateMenuView.as_view(), name="translate_menu_item"),
    path("reorder/", ReorderMenuItemsView.as_view(), name="reorder_menu_items")
]