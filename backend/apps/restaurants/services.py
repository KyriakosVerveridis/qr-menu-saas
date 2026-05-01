from .models import Restaurant

def get_user_restaurants(user):
    return Restaurant.objects.filter(owner=user)