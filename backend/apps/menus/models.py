from django.db import models
from apps.restaurants.models import Restaurant
from apps.categories.models import Category
from apps.languages.models import Language


class Allergen(models.Model):
    """Τα 14 επίσημα EU allergens (Regulation 1169/2011)."""
    code = models.CharField(max_length=20, unique=True)
    name_el = models.CharField(max_length=100)
    name_en = models.CharField(max_length=100)

    def __str__(self):
        return self.name_el


class AllergenTranslation(models.Model):
    allergen = models.ForeignKey(
        Allergen,
        related_name='translations',
        on_delete=models.CASCADE
    )
    language = models.ForeignKey(Language, on_delete=models.PROTECT)
    name = models.CharField(max_length=100)

    class Meta:
        unique_together = ('allergen', 'language')

    def __str__(self):
        return f"[{self.language.code}] {self.name}"


class MenuItem(models.Model):
    """Container model - το όνομα/περιγραφή ζουν στο MenuItemTranslation."""
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name="menu_items")
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name="menu_items")
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.URLField(blank=True)
    order = models.IntegerField(default=0)
    allergens = models.ManyToManyField(Allergen, blank=True, related_name="menu_items")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        translation = self.translations.filter(language__code='el').first()
        return translation.name if translation else f"MenuItem #{self.id}"


class MenuItemTranslation(models.Model):
    menu_item = models.ForeignKey(
        MenuItem,
        related_name='translations',
        on_delete=models.CASCADE
    )
    language = models.ForeignKey(Language, on_delete=models.PROTECT)
    name = models.CharField(max_length=255, verbose_name="Όνομα")
    description = models.TextField(blank=True, verbose_name="Περιγραφή")

    class Meta:
        unique_together = ('menu_item', 'language')

    def __str__(self):
        return f"[{self.language.code}] {self.name}"