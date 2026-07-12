from django.contrib import admin
from .models import Category, MasterCategory, MasterCategoryTranslation


class MasterCategoryTranslationInline(admin.TabularInline):
    model = MasterCategoryTranslation
    extra = 1


@admin.register(MasterCategory)
class MasterCategoryAdmin(admin.ModelAdmin):
    list_display = ('id', '__str__')
    inlines = [MasterCategoryTranslationInline]


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'get_category_name', 'restaurant')
    list_filter = ('restaurant',)

    def get_category_name(self, obj):
        return str(obj.master_category)
    get_category_name.short_description = 'Όνομα Κατηγορίας'