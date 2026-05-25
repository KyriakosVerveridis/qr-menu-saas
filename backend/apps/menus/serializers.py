from rest_framework import serializers
from .models import MenuItem

class PublicMenuItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuItem
        fields = ["id", "category", "price", "image", "name", "description"]

# --- NEW SERIALIZER FOR THE MERCHANT DASHBOARD (SaaS Ready) ---
class MenuItemCreateSerializer(serializers.ModelSerializer):
    name = serializers.JSONField() 
    description = serializers.JSONField(required=False)

    class Meta:
        model = MenuItem
        fields = ["restaurant", "category", "price", "image", "name", "description"]
        read_only_fields = ["restaurant"]

    def create(self, validated_data):
        return MenuItem.objects.create(**validated_data)
    