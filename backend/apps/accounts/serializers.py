from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Profile

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Το email χρησιμοποιείται ήδη.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
        )
        return user    

class ProfileSerializer(serializers.ModelSerializer):
    # Pulls the username directly from the related User model
    username = serializers.CharField(source="user.username", read_only=True)
    
    class Meta:
        model = Profile
        fields = ['id', 'user', 'created_at', 'username']
        read_only_fields = ['id', 'user', 'created_at', 'username'] 