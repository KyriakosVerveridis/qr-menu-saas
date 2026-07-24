from django.db import models
from apps.business_types.models import BusinessType
from django.contrib.auth import get_user_model
from django.utils.text import slugify
from unidecode import unidecode

User = get_user_model()

class Restaurant(models.Model):
    business_type = models.ForeignKey(
        BusinessType,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='restaurants'
    )
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, blank=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="restaurants")
    address = models.TextField(blank=True, null=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            # 1. Καθαρισμός ονόματος
            latin_name = unidecode(self.name).lower().replace(" ", "_")
            
            # 2. Ορίζουμε ένα σταθερό πρόθεμα (π.χ. 'gr' για Ελλάδα)
            prefix = "st" 
            base_slug = f"{latin_name}_{prefix}"
            
            # 3. Έλεγχος για μοναδικότητα με προσθετικό αριθμό
            new_slug = base_slug
            counter = 1
            
            # Όσο υπάρχει slug στη βάση, αυξάνουμε τον αριθμό
            while Restaurant.objects.filter(slug=new_slug).exists():
                new_slug = f"{base_slug}_{counter}"
                counter += 1
            
            self.slug = new_slug
            
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name
