from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import MasterCategory, Category
from .serializers import MasterCategorySerializer, CategorySerializer
from rest_framework.permissions import AllowAny

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
            serializer.save(restaurant=restaurant)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)