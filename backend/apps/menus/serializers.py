from rest_framework import serializers
from .models import MenuItem, MenuItemTranslation
from apps.categories.models import Category
from apps.languages.models import Language


class MenuItemTranslationSerializer(serializers.ModelSerializer):
    language_code = serializers.CharField(source='language.code')

    class Meta:
        model = MenuItemTranslation
        fields = ['language_code', 'name', 'description']


class MenuItemCreateSerializer(serializers.ModelSerializer):
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all())
    translations = MenuItemTranslationSerializer(many=True)

    class Meta:
        model = MenuItem
        fields = ["id", "restaurant", "category", "price", "image", "translations"]
        read_only_fields = ["restaurant"]

    def create(self, validated_data):
        translations_data = validated_data.pop('translations')
        menu_item = MenuItem.objects.create(**validated_data)
        self._save_translations(menu_item, translations_data)
        return menu_item

    def update(self, instance, validated_data):
        translations_data = validated_data.pop('translations', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if translations_data is not None:
            self._save_translations(instance, translations_data)
        return instance

    def _save_translations(self, menu_item, translations_data):
        for translation in translations_data:
            language_code = translation['language']['code']
            language = Language.objects.get(code=language_code)
            MenuItemTranslation.objects.update_or_create(
                menu_item=menu_item,
                language=language,
                defaults={
                    'name': translation['name'],
                    'description': translation.get('description', ''),
                }
            )


class PublicMenuItemSerializer(serializers.ModelSerializer):
    translations = MenuItemTranslationSerializer(many=True, read_only=True)

    class Meta:
        model = MenuItem
        fields = ["id", "price", "image", "translations"]