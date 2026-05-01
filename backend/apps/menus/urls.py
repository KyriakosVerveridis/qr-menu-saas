from django.urls import path
from .views import public_menu

urlpatterns = [
    path("public/<int:restaurant_id>/", public_menu),
]