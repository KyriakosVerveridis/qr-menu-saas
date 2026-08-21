from django.db import models
from apps.languages.models import Language


class MasterCategory(models.Model):
    """Container model - δεν κρατάει κείμενο, μόνο ταυτότητα. Το πραγματικό
    όνομα ζει στο MasterCategoryTranslation, ένα ανά γλώσσα."""
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        translation = self.translations.filter(language__code='el').first()
        return translation.name if translation else f"MasterCategory #{self.id}"


class MasterCategoryTranslation(models.Model):
    master_category = models.ForeignKey(
        MasterCategory,
        related_name='translations',
        on_delete=models.CASCADE
    )
    language = models.ForeignKey(Language, on_delete=models.PROTECT)
    name = models.CharField(max_length=100)

    class Meta:
        unique_together = ('master_category', 'language')

    def __str__(self):
        return f"[{self.language.code}] {self.name}"


class Category(models.Model):
    restaurant = models.ForeignKey(
        'restaurants.Restaurant',
        on_delete=models.CASCADE,
        related_name="restaurant_categories"
    )
    master_category = models.ForeignKey(
        MasterCategory,
        on_delete=models.PROTECT,
        related_name="categories"
    )
    order = models.IntegerField(default=0)

    class Meta:
        verbose_name_plural = "Categories"
        unique_together = ('restaurant', 'master_category')
        ordering = ['order']

    def __str__(self):
        return f"{self.restaurant.name} - {self.master_category}"