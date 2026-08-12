from django.contrib import admin
from .models import Subscription

# Register your models here.
@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ('id', 'restaurant', 'plan_type', 'status', 'stripe_customer_id', 'stripe_subscription_id', 'created_at')
    list_filter = ('plan_type', 'status', 'created_at')
    search_fields = ('restaurant__name', 'stripe_customer_id', 'stripe_subscription_id')    

    
