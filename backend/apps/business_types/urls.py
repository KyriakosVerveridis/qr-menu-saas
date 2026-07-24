from django.urls import path
from .views import BusinessTypeListView

urlpatterns = [
    path('list/', BusinessTypeListView.as_view(), name='business-type-list'), 
]