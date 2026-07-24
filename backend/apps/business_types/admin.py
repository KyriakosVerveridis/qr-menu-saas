from django.contrib import admin
from .models import BusinessType, BusinessTypeMasterCategory

@admin.register(BusinessType)
class BusinessTypeAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')

@admin.register(BusinessTypeMasterCategory)
class BusinessTypeMasterCategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'business_type', 'master_category')
