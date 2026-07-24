from rest_framework import serializers
from .models import BusinessType, BusinessTypeMasterCategory
from apps.categories.serializers import MasterCategorySerializer
from apps.categories.models import MasterCategory

class BusinessTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = BusinessType
        fields = ['id', 'name']

class BusinessTypeMasterCategorySerializer(serializers.ModelSerializer):    
    business_type = BusinessTypeSerializer(read_only=True)
    master_category = MasterCategorySerializer(read_only=True)

    class Meta:
        model = BusinessTypeMasterCategory
        fields = ['id', 'business_type', 'master_category']
