from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from rest_framework import status
from apps.restaurants.models import Restaurant
from .models import MasterCategory, Category
from .serializers import MasterCategorySerializer, CategorySerializer
from rest_framework.permissions import AllowAny
from django.db import IntegrityError

class MasterCategoryListView(APIView):
    # permission_classes = [IsAuthenticated]
    permission_classes = [AllowAny]

    def get(self, request):
        categories = MasterCategory.objects.all()
        serializer = MasterCategorySerializer(categories, many=True)
        return Response(serializer.data)

class CategoryListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        restaurant_id = request.query_params.get('restaurant')
        categories = Category.objects.filter(
            restaurant_id=restaurant_id,
            restaurant__owner=request.user
        )
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = CategorySerializer(data=request.data)
        if serializer.is_valid():
            restaurant = get_object_or_404(Restaurant, id=request.data.get('restaurant'), owner=request.user)
            try:
                serializer.save(restaurant=restaurant)
            except IntegrityError:
                return Response(
                    {"error": "Αυτή η κατηγορία υπάρχει ήδη για το συγκεκριμένο κατάστημα."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk=None):
        category = get_object_or_404(Category, pk=pk, restaurant__owner=request.user)
        category.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class ReorderCategoriesView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        category_ids = request.data.get('category_ids', [])

        for index, category_id in enumerate(category_ids):
            Category.objects.filter(id=category_id, restaurant__owner=request.user).update(order=index)

        return Response({"message": "Η σειρά ενημερώθηκε."}, status=status.HTTP_200_OK)    