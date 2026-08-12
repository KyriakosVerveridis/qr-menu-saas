import stripe
from .models import Subscription
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.conf import settings
from apps.restaurants.models import Restaurant


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

class StripeWebhookView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')

        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
        except (ValueError, stripe.error.SignatureVerificationError):
            return Response(status=status.HTTP_400_BAD_REQUEST)

        if event['type'] == 'checkout.session.completed':
            session = event['data']['object']
            restaurant_id = session.get('client_reference_id')

            Subscription.objects.create(
                restaurant_id=restaurant_id,
                plan_type=session.get('metadata', {}).get('plan_type', 'yearly'),
                status='active',
                stripe_customer_id=session.get('customer'),
                stripe_subscription_id=session.get('subscription'),
            )

        return Response(status=status.HTTP_200_OK)