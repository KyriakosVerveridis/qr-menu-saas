from django.contrib import admin
from .models import MenuItem, MenuItemTranslation


class MenuItemTranslationInline(admin.TabularInline):
    model = MenuItemTranslation
    extra = 1


@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = ('id', '__str__', 'restaurant', 'category', 'price')
    list_filter = ('restaurant',)
    inlines = [MenuItemTranslationInline]