from rest_framework import serializers
from .models import MenuItem


class PublicMenuItemSerializer(serializers.ModelSerializer):
    # Since category.name is also a JSONField, DRF will automatically return it as an object
    category = serializers.CharField(source="category.name")
    
    class Meta:
        model = MenuItem
        fields = [
            "id",
            "category",
            "price",
            "image",
            "name",
            "description",
        ]