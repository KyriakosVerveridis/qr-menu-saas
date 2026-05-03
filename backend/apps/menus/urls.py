from django.urls import path
from .views import public_menu

urlpatterns = [
    path("public/<slug:slug>/", public_menu),
]