def get_user_restaurants(user):
    return user.restaurants.all()  # Return all restaurants owned by the given user