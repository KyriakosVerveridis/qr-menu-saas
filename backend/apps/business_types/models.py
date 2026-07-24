from django.db import models


class BusinessType(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class BusinessTypeMasterCategory(models.Model):
    business_type = models.ForeignKey(BusinessType, on_delete=models.CASCADE, related_name='master_categories')
    master_category = models.ForeignKey('categories.MasterCategory', on_delete=models.CASCADE, related_name='business_types')

    class Meta:
        unique_together = ('business_type', 'master_category')

    def __str__(self):
        return f"{self.business_type.name} - {self.master_category}"    