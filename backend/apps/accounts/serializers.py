from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Profile

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}}

class ProfileSerializer(serializers.ModelSerializer):
    # Pulls the username directly from the related User model
    username = serializers.CharField(source="user.username", read_only=True)
    
    class Meta:
        model = Profile
        fields = ['id', 'user', 'created_at', 'username']
        read_only_fields = ['id', 'user', 'created_at', 'username'] 