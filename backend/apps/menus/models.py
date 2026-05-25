from django.db import models
from apps.restaurants.models import Restaurant
from apps.categories.models import Category

# --- MENU ITEM MODEL ---
class MenuItem(models.Model):
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name="menu_items")
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name="menu_items")
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.URLField(blank=True)

    # Κράτα μόνο τα Ελληνικά πεδία
    name = models.CharField(max_length=255, verbose_name="Όνομα")
    description = models.TextField(blank=True, verbose_name="Περιγραφή")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name