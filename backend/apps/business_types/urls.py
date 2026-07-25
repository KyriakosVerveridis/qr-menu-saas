from django.urls import path
from .views import BusinessTypeCategoriesView, BusinessTypeListView

urlpatterns = [
    path('list/', BusinessTypeListView.as_view(), name='business-type-list'),
    path('<int:pk>/categories/', BusinessTypeCategoriesView.as_view(), name='business-type-categories'),
]