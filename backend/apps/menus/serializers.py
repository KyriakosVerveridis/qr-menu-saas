import json
from rest_framework import serializers
import cloudinary.uploader
from .models import MenuItem, MenuItemTranslation, Allergen
from apps.categories.models import Category
from apps.languages.models import Language

class AllergenSerializer(serializers.ModelSerializer):
    class Meta:
        model = Allergen
        fields = ['id', 'code', 'name_el', 'name_en']

class MenuItemTranslationSerializer(serializers.ModelSerializer):
    language_code = serializers.CharField(source='language.code')

    class Meta:
        model = MenuItemTranslation
        fields = ['language_code', 'name', 'description']


class MenuItemCreateSerializer(serializers.ModelSerializer):
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all())
    image_file = serializers.ImageField(write_only=True, required=False)
    translations = MenuItemTranslationSerializer(many=True, read_only=True)
    allergens = AllergenSerializer(many=True, read_only=True)

    class Meta:
        model = MenuItem
        fields = ["id", "restaurant", "category", "price", "image", "image_file", "translations", "allergens"]
        read_only_fields = ["restaurant", "image"]

    def _parse_allergen_ids(self):
        raw = self.initial_data.get('allergen_ids')
        if not raw:
            return []
        try:
            return json.loads(raw)
        except (TypeError, ValueError):
            return []

    def _parse_translations(self):
        raw = self.initial_data.get('translations')
        if not raw:
            return []
        if isinstance(raw, str):
            try:
                return json.loads(raw)
            except (TypeError, ValueError):
                return []
        return raw

    def _upload_image(self, image_file):
        upload_result = cloudinary.uploader.upload(
            image_file,
            width=400,
            height=400,
            crop="limit",
            quality="auto:eco",
            fetch_format="auto",
        )
        return upload_result['secure_url']

    def create(self, validated_data):
        translations_data = self._parse_translations()
        allergen_ids = self._parse_allergen_ids()
        image_file = validated_data.pop('image_file', None)
        if image_file:
            validated_data['image'] = self._upload_image(image_file)
        menu_item = MenuItem.objects.create(**validated_data)
        menu_item.allergens.set(allergen_ids)
        self._save_translations(menu_item, translations_data)
        return menu_item

    def update(self, instance, validated_data):
        translations_data = self._parse_translations()
        allergen_ids = self._parse_allergen_ids()
        image_file = validated_data.pop('image_file', None)
        if image_file:
            instance.image = self._upload_image(image_file)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        instance.allergens.set(allergen_ids)
        if translations_data:
            self._save_translations(instance, translations_data)
        return instance

    def _save_translations(self, menu_item, translations_data):
        restaurant = self.context.get('restaurant')
        has_premium = self._restaurant_has_premium(restaurant)

        for translation in translations_data:
            language_code = translation.get('language_code')
            if not language_code:
                continue

            if language_code != 'el' and not has_premium:
                raise serializers.ValidationError(
                    f"Η γλώσσα '{language_code}' απαιτεί ενεργή συνδρομή Premium. Χρησιμοποίησε το κουμπί μετάφρασης για Αγγλικά."
                )

            language = Language.objects.get(code=language_code)
            MenuItemTranslation.objects.update_or_create(
                menu_item=menu_item,
                language=language,
                defaults={
                    'name': translation.get('name', ''),
                    'description': translation.get('description', ''),
                }
            )

    def _restaurant_has_premium(self, restaurant):
        from apps.billing.models import Subscription
        if not restaurant:
            return False
        return Subscription.objects.filter(restaurant=restaurant, status='active').exists()


class PublicMenuItemSerializer(serializers.ModelSerializer):
    translations = MenuItemTranslationSerializer(many=True, read_only=True)
    allergens = AllergenSerializer(many=True, read_only=True)

    class Meta:
        model = MenuItem
        fields = ["id", "price", "image", "translations", "allergens"]