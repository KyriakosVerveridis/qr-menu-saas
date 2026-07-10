from rest_framework import serializers
from .models import MenuItem
from apps.categories.models import Category

class MenuItemCreateSerializer(serializers.ModelSerializer):
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all())
    name = serializers.JSONField()
    description = serializers.JSONField(required=False)

    class Meta:
        model = MenuItem
        fields = ["id", "restaurant", "category", "price", "image", "name", "description"]
        read_only_fields = ["restaurant"]

class PublicMenuItemSerializer(serializers.ModelSerializer):
    category = serializers.SerializerMethodField()

    class Meta:
        model = MenuItem
        fields = ["id", "category", "price", "image", "name", "description"]

    def get_category(self, obj):
        return str(obj.category.master_category)