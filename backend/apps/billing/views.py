import stripe
from .models import Subscription
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.conf import settings
from apps.restaurants.models import Restaurant
from datetime import datetime, timezone
from .serializers import SubscriptionSerializer


class CreateCheckoutSessionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        restaurant_id = request.data.get('restaurant_id')
        plan_type = request.data.get('plan_type')

        if not restaurant_id or not plan_type:
            return Response({"error": "restaurant_id and plan_type are required"}, status=status.HTTP_400_BAD_REQUEST)

        restaurant = Restaurant.objects.filter(id=restaurant_id, owner=request.user).first()
        if not restaurant:
            return Response({"error": "Restaurant not found"}, status=status.HTTP_404_NOT_FOUND)

        price_id = settings.STRIPE_PRICE_YEARLY if plan_type == 'yearly' else settings.STRIPE_PRICE_MONTHLY

        stripe.api_key = settings.STRIPE_SECRET_KEY

        session = stripe.checkout.Session.create(
            mode='subscription',
            payment_method_types=['card'],
            line_items=[{'price': price_id, 'quantity': 1}],
            success_url=f"{settings.FRONTEND_URL}/dashboard?payment=success",
            cancel_url=f"{settings.FRONTEND_URL}/dashboard?payment=cancelled",
            client_reference_id=str(restaurant.id),
            metadata={'plan_type': plan_type},
        )

        return Response({"checkout_url": session.url}, status=status.HTTP_200_OK)

class CreateBillingPortalSessionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        restaurant_id = request.data.get('restaurant_id')

        if not restaurant_id:
            return Response({"error": "restaurant_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        restaurant = Restaurant.objects.filter(id=restaurant_id, owner=request.user).first()
        if not restaurant:
            return Response({"error": "Restaurant not found"}, status=status.HTTP_404_NOT_FOUND)

        subscription = Subscription.objects.filter(restaurant=restaurant, status='active').first()
        if not subscription:
            return Response({"error": "No active subscription found"}, status=status.HTTP_404_NOT_FOUND)

        stripe.api_key = settings.STRIPE_SECRET_KEY

        portal_session = stripe.billing_portal.Session.create(
            customer=subscription.stripe_customer_id,
            return_url=f"{settings.FRONTEND_URL}/dashboard",
        )

        return Response({"portal_url": portal_session.url}, status=status.HTTP_200_OK)
  
class SubscriptionStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        restaurant_id = request.query_params.get('restaurant_id')

        if not restaurant_id:
            return Response({"error": "restaurant_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        restaurant = Restaurant.objects.filter(id=restaurant_id, owner=request.user).first()
        if not restaurant:
            return Response({"error": "Restaurant not found"}, status=status.HTTP_404_NOT_FOUND)

        subscription = Subscription.objects.filter(restaurant=restaurant, status='active').first()
        if not subscription:
            return Response({"has_subscription": False}, status=status.HTTP_200_OK)

        serializer = SubscriptionSerializer(subscription)
        return Response({"has_subscription": True, "subscription": serializer.data}, status=status.HTTP_200_OK)

class StripeWebhookView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        stripe.api_key = settings.STRIPE_SECRET_KEY
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')

        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
        except (ValueError, stripe.error.SignatureVerificationError):
            return Response(status=status.HTTP_400_BAD_REQUEST)

        if event.type == 'checkout.session.completed':
            session = event.data.object
            restaurant_id = session.client_reference_id

            stripe_subscription = stripe.Subscription.retrieve(session.subscription)
            period_end_timestamp = stripe_subscription['items']['data'][0]['current_period_end']
            period_end = datetime.fromtimestamp(period_end_timestamp, tz=timezone.utc)

            Subscription.objects.update_or_create(
                stripe_subscription_id=session.subscription,
                defaults={
                    'restaurant_id': restaurant_id,
                    'plan_type': getattr(session.metadata, 'plan_type', 'yearly'),
                    'status': 'active',
                    'stripe_customer_id': session.customer,
                    'current_period_end': period_end,
                },
            )

        elif event.type == 'customer.subscription.deleted':
            stripe_subscription = event.data.object
            Subscription.objects.filter(stripe_subscription_id=stripe_subscription.id).update(status='inactive')

        elif event.type == 'customer.subscription.updated':
            stripe_subscription = event.data.object
            new_status = 'active' if stripe_subscription.status == 'active' else 'inactive'
            Subscription.objects.filter(stripe_subscription_id=stripe_subscription.id).update(status=new_status)

        return Response(status=status.HTTP_200_OK)