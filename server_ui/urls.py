# -*- coding: utf-8 -*-
from django.urls import path

from .views import home, about, docs, faq, help, privacy

urlpatterns = [
  path('', home),
  path('about', about),
  path('docs', docs),
  path('faq', faq),
  path('privacy', privacy),
  path('help', help),
]
