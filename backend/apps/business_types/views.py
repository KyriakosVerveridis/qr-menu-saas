from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import BusinessType
from .serializers import BusinessTypeSerializer


# Create your views here.

class BusinessTypeListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        business_types = BusinessType.objects.all()
        serializer = BusinessTypeSerializer(business_types, many=True)
        return Response(serializer.data)       