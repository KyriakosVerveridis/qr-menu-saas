from django.db import models
from apps.restaurants.models import Restaurant

class MenuCategory(models.Model):
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name="menu_categories")
    
    # We use JSONField to support multiple languages for the category too (e.g., {"GR": "Ορεκτικά", "EN": "Appetizers"})
    name = models.JSONField(default=dict) 

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return str(self.name.get('GR', 'Unnamed Category'))
    

    # --- MENU ITEM MODEL ---
class MenuItem(models.Model):
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name="menu_items")
    category = models.ForeignKey(MenuCategory, on_delete=models.CASCADE, related_name="menu_items")
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.URLField(blank=True)

    # Plain text fields for 2 languages (Greek / English)
    name_gr = models.CharField(max_length=255, verbose_name="Όνομα (Ελληνικά)", default="")
    name_en = models.CharField(max_length=255, verbose_name="Όνομα (English)", default="")
    
    description_gr = models.TextField(blank=True, verbose_name="Περιγραφή (Ελληνικά)", default="")
    description_en = models.TextField(blank=True, verbose_name="Περιγραφή (English)", default="")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Automatic JSON structure conversion for the Frontend API
    @property
    def name(self):
        return {"GR": self.name_gr, "EN": self.name_en}

    @property
    def description(self):
        return {"GR": self.description_gr, "EN": self.description_en}

    def __str__(self):
        return self.name_gr