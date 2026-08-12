import stripe
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
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
        )

        return Response({"checkout_url": session.url}, status=status.HTTP_200_OK)