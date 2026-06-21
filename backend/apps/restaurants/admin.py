from django.contrib import admin
from .models import Restaurant
from apps.categories.models import Category # Εισαγωγή από το σωστό μέρος

class CategoryInline(admin.TabularInline):
    model = Category
    extra = 1

@admin.register(Restaurant)
class RestaurantAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'owner', 'created_at')
    search_fields = ('name', 'owner__username')
    list_filter = ('created_at',)
    inlines = [CategoryInline]
