from rest_framework import serializers
from .models import MenuItem, MenuCategory

class PublicMenuItemSerializer(serializers.ModelSerializer):
    category = serializers.CharField(source="category.name")
    
    class Meta:
        model = MenuItem
        fields = ["id", "category", "price", "image", "name", "description"]

# --- NEW SERIALIZER FOR THE MERCHANT DASHBOARD ---
class MenuItemCreateSerializer(serializers.ModelSerializer):
    # Map explicit frontend form fields
    name_gr = serializers.CharField(write_only=True)
    name_en = serializers.CharField(write_only=True)
    description_gr = serializers.CharField(write_only=True, required=False, allow_blank=True, default="")
    description_en = serializers.CharField(write_only=True, required=False, allow_blank=True, default="")
    
    category = serializers.PrimaryKeyRelatedField(queryset=MenuCategory.objects.all())

    class Meta:
        model = MenuItem
        fields = [
            "restaurant", "category", "price", "image",
            "name_gr", "name_en", "description_gr", "description_en"
        ]

    def create(self, validated_data):
        # Since fields perfectly match the model fields (name_gr, name_en, etc.),
        # we can pass validated_data directly to the creation query.
        return MenuItem.objects.create(**validated_data)