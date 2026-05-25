from django.db import models
from apps.restaurants.models import Restaurant

# --- CATEGORY MODEL ---
class MasterCategory(models.Model):
    name = models.CharField(max_length=100, unique=True, verbose_name="Master Category Name")

    def __str__(self):
        return self.name

class Category(models.Model):
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name="categories")
    master_category = models.ForeignKey(MasterCategory, on_delete=models.PROTECT, related_name="categories")        

    class Meta:
        verbose_name_plural = "Categories"
        unique_together = ('restaurant', 'master_category')

    def __str__(self):
        return f"{self.restaurant.name} - {self.master_category.name}"
