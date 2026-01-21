from django.shortcuts import render

from .models import Product

# Create your views here.
def productsView(request):
    template = 'products/products.html'
    context = {
        'products' : Product.objects.all(),
        'current_page' : 'products'
    }
    return render(request, template, context)

# search Products
from django.db.models import Q 
def searchProducts(request):
    template = 'products/search_results.html'
    query = request.GET.get('q')
    if query:
        search_results = Product.objects.filter(
            Q(title__icontains = query) |
            Q(desc__icontains = query) 
        )
        
        context = {
            'query' : query,
            'products' : search_results
        }
    return render(request, template_name=template, context = context)


# CRUD Operations using Generic Class Based Views of Django

from django.views.generic import ( CreateView, DetailView,
                                   UpdateView, DeleteView )

# ListView has already been implemented using a function above : productsView()

class CreateProduct(CreateView):
    model = Product
    template_name = 'products/add_product.html'
    fields = '__all__'
    # redirection url for successful creation of resource
    success_url = '/'

class ProductDetail(DetailView):
    model = Product
    template_name = 'products/product_details.html'
    context_object_name = 'product'

class UpdateProduct(UpdateView):
    model = Product
    fields = '__all__'
    template_name = 'products/update_product.html'
    success_url = '/'

class DeleteProduct(DeleteView):
    model = Product
    template_name = 'products/delete_product.html'
    success_url = '/'

