from django.db import models

# Create your models here.

from django.db import models


class Language(models.Model):
    code = models.CharField(max_length=5, unique=True)  # 'el', 'en', 'de', 'fr'...
    name = models.CharField(max_length=50)  # 'Ελληνικά', 'English', 'Deutsch'
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['code']

    def __str__(self):
        return f"{self.name} ({self.code})"
