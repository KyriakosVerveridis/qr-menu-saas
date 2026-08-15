from django.urls import path
from .views import CreateCheckoutSessionView, StripeWebhookView, CreateBillingPortalSessionView, SubscriptionStatusView


urlpatterns = [
    path('create-checkout-session/', CreateCheckoutSessionView.as_view(), name='create-checkout-session'),
    path('create-billing-portal-session/', CreateBillingPortalSessionView.as_view(), name='create-billing-portal-session'),
    path('subscription-status/', SubscriptionStatusView.as_view(), name='subscription-status'),
    path('webhook/', StripeWebhookView.as_view(), name='stripe-webhook'),
    
]