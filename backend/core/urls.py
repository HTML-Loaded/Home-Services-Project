from django.urls import path

from . import views

urlpatterns = [
    path("auth/register/", views.register),
    path("auth/login/", views.login),
    path("categories/", views.list_categories),
    path("providers/become/", views.become_provider),
    path("providers/categories/", views.set_provider_categories),
    path("jobs/", views.create_job),
    path("jobs/list/", views.list_jobs),
    path("jobs/<int:job_id>/book/", views.book_job),
    path("bookings/select/", views.select_booking),
    path("bookings/cancel/", views.cancel_booking),
    path("bookings/complete/", views.complete_booking),
    path("bookings/pay/", views.pay_booking),
    path("bookings/review/", views.review_booking),
]
