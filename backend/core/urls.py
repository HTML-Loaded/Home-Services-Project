from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from . import views

urlpatterns = [
    path("auth/register/", views.register),
    path("auth/login/", views.login),
    path("auth/refresh/", TokenRefreshView.as_view()),
    path("me/", views.me),
    path("categories/", views.list_categories),
    path("providers/become/", views.become_provider),
    path("providers/profile/", views.provider_profile),
    path("providers/categories/", views.set_provider_categories),
    path("jobs/", views.create_job),
    path("jobs/mine/", views.my_jobs),
    path("jobs/list/", views.list_jobs),
    path("jobs/<int:job_id>/", views.job_detail),
    path("jobs/<int:job_id>/book/", views.book_job),
    path("bookings/mine/", views.my_bookings),
    path("bookings/<int:booking_id>/", views.booking_detail),
    path("payments/mine/", views.my_payments),
    path("reviews/mine/", views.my_reviews),
    path("reviews/<int:booking_id>/", views.review_detail),
    path("bookings/select/", views.select_booking),
    path("bookings/cancel/", views.cancel_booking),
    path("bookings/complete/", views.complete_booking),
    path("bookings/pay/", views.pay_booking),
    path("bookings/review/", views.review_booking),
    path("disputes/", views.create_dispute),
    path("disputes/list/", views.list_disputes),
    path("providers/list/", views.list_providers),

    path("admin/users/", views.admin_list_users),
    path("admin/users/<int:user_id>/deactivate/", views.admin_deactivate_user),
]
