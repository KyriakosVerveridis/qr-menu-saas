from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.user.username