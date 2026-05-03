from django.db import models
from apps.restaurants.models import Restaurant

class MenuCategory(models.Model):
    name = models.CharField(max_length=255)
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name="menu_categories")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class MenuItem(models.Model):
    category = models.ForeignKey(MenuCategory, on_delete=models.CASCADE, related_name="menu_items")
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.URLField(blank=True)

    name_GR = models.CharField(max_length=255)
    desc_GR = models.TextField(blank=True)

    name_EN = models.CharField(max_length=255)
    desc_EN = models.TextField(blank=True)

    name_BG = models.CharField(max_length=255, blank=True)
    desc_BG = models.TextField(blank=True)

    name_RS = models.CharField(max_length=255, blank=True)
    desc_RS = models.TextField(blank=True)

    name_RO = models.CharField(max_length=255, blank=True)
    desc_RO = models.TextField(blank=True)

    name_DE = models.CharField(max_length=255, blank=True)
    desc_DE = models.TextField(blank=True)

    name_TR = models.CharField(max_length=255, blank=True)
    desc_TR = models.TextField(blank=True)

    restaurant = models.ForeignKey("restaurants.Restaurant", on_delete=models.CASCADE)