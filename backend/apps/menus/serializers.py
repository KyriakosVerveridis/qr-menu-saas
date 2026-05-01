from rest_framework import serializers
from .models import MenuItem


class PublicMenuItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuItem
        fields = [
            "id",
            "category",
            "price",
            "image",
            "name_GR",
            "desc_GR",
            "name_EN",
            "desc_EN",
            "name_BG",
            "desc_BG",
            "name_RS",
            "desc_RS",
            "name_RO",
            "desc_RO",
            "name_DE",
            "desc_DE",
            "name_TR",
            "desc_TR",
        ]