from rest_framework import serializers
from .models import MasterCategory, MasterCategoryTranslation, Category


class MasterCategoryTranslationSerializer(serializers.ModelSerializer):
    language_code = serializers.CharField(source='language.code', read_only=True)

    class Meta:
        model = MasterCategoryTranslation
        fields = ['language_code', 'name']


class MasterCategorySerializer(serializers.ModelSerializer):
    translations = MasterCategoryTranslationSerializer(many=True, read_only=True)

    class Meta:
        model = MasterCategory
        fields = ['id', 'translations']


class CategorySerializer(serializers.ModelSerializer):
    master_category_name = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'master_category', 'master_category_name']

    def get_master_category_name(self, obj):
        return str(obj.master_category)