from django.urls import path
from .views import MasterCategoryListView, CategoryListView

urlpatterns = [
    path('master-list/', MasterCategoryListView.as_view(), name='master-categories'),
    path('my-categories/', CategoryListView.as_view(), name='my-categories'),
    path('my-categories/<int:pk>/', CategoryListView.as_view(), name='my-category-detail'),
]