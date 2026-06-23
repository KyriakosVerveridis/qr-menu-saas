from rest_framework import serializers
from .models import MenuItem
from apps.categories.models import Category

class MenuItemCreateSerializer(serializers.ModelSerializer):
    # Ορίζουμε το queryset εδώ απευθείας
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all())
    name = serializers.JSONField() 
    description = serializers.JSONField(required=False)

    class Meta:
        model = MenuItem
        fields = ["restaurant", "category", "price", "image", "name", "description"]
        read_only_fields = ["restaurant"]

class PublicMenuItemSerializer(serializers.ModelSerializer):
    category = serializers.CharField(source='category.master_category.name', read_only=True)

    class Meta:
        model = MenuItem
        fields = ["id", "category", "price", "image", "name", "description"]