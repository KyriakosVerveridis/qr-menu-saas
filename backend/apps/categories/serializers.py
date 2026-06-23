from rest_framework import serializers
from .models import MasterCategory, Category

class MasterCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = MasterCategory
        fields = ['id', 'name']

class CategorySerializer(serializers.ModelSerializer):
    master_category_name = serializers.ReadOnlyField(source='master_category.name')

    class Meta:
        model = Category
        fields = ['id', 'master_category', 'master_category_name']