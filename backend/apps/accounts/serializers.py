from rest_framework import serializers
from .models import Profile

class ProfileSerializer(serializers.ModelSerializer):
    # Pulls the username directly from the related User model
    username = serializers.CharField(source="user.username", read_only=True)
    
    class Meta:
        model = Profile
        fields = ['id', 'user', 'created_at', 'username']
        read_only_fields = ['id', 'user', 'created_at', 'username'] 