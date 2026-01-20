from django.urls import path

from .views import productsView, searchProducts

urlpatterns = [
    path('all/', productsView, name = 'products'),

    path('search', searchProducts, name = 'search_products')
]