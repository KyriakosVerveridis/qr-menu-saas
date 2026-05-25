from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import MasterCategory, Category
from .serializers import MasterCategorySerializer, CategorySerializer

class MasterCategoryListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        categories = MasterCategory.objects.all()
        serializer = MasterCategorySerializer(categories, many=True)
        return Response(serializer.data)

class CategoryListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        restaurant_id = request.query_params.get('restaurant')
        categories = Category.objects.filter(restaurant_id=restaurant_id)
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = CategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)