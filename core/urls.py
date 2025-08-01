"""
URL configuration for core project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path
from .health import health_check
from .sse_demo import sse_demo
from .sse_demo_2 import sse_demo_2
from .sse_demo_3 import sse_demo_3
from .sse_demo_4 import sse_system_stats

urlpatterns = [
    path("admin/", admin.site.urls),
    path('api/health/', health_check, name='health-check'),
    path('api/sse-demo', sse_demo, name='sse-demo'),
    path('api/sse-demo-2', sse_demo_2, name='sse-demo-2'),
    path('api/sse-demo-3', sse_demo_3, name='sse-demo-3'),
    path('api/sse-system-stats', sse_system_stats, name='sse-system-stats'),
]
