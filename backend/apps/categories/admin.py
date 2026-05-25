from django.contrib import admin
from .models import Category, MasterCategory

@admin.register(MasterCategory)
class MasterCategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')
    search_fields = ('name',)

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'get_category_name', 'restaurant') 
    list_filter = ('restaurant',)
    search_fields = ('master_category__name',)

    def get_category_name(self, obj):
        return obj.master_category.name
    get_category_name.short_description = 'Όνομα Κατηγορίας'