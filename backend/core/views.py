from rest_framework import permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from . import services
from .models import User
from .serializers import (
    BookingIdSerializer,
    BecomeProviderSerializer,
    BookJobSerializer,
    CreatePaymentSerializer,
    CreateReviewSerializer,
    JobPostingCreateSerializer,
    JobPostingSerializer,
    RegisterSerializer,
    ServiceProviderSerializer,
    SetProviderCategoriesSerializer,
)


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save(is_active=True)
    return Response({"user_id": user.user_id}, status=status.HTTP_201_CREATED)


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def login(request):
    email = request.data.get("email")
    password = request.data.get("password")
    if not email or not password:
        return Response({"detail": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(email=email, is_active=True)
    except User.DoesNotExist:
        return Response({"detail": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)

    if not user.check_password(password):
        return Response({"detail": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)

    refresh = RefreshToken.for_user(user)
    return Response({"access": str(refresh.access_token), "refresh": str(refresh)})


@api_view(["POST"])
def become_provider(request):
    serializer = BecomeProviderSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    provider = services.become_provider(request.user, **serializer.validated_data)
    return Response(ServiceProviderSerializer(provider).data, status=status.HTTP_201_CREATED)


@api_view(["PUT"])
def set_provider_categories(request):
    serializer = SetProviderCategoriesSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    services.set_provider_categories(request.user, serializer.validated_data["category_ids"])
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["POST"])
def create_job(request):
    serializer = JobPostingCreateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    job = services.create_job_posting(user=request.user, **serializer.validated_data)
    return Response(JobPostingSerializer(job).data, status=status.HTTP_201_CREATED)


@api_view(["GET"])
def list_jobs(request):
    category_id = request.query_params.get("category_id")
    service_area = request.query_params.get("service_area")
    if category_id is None or service_area is None:
        return Response({"detail": "category_id and service_area required"}, status=status.HTTP_400_BAD_REQUEST)

    jobs = services.get_postings(category_id=category_id, service_area=service_area)
    return Response(JobPostingSerializer(jobs, many=True).data)


@api_view(["POST"])
def book_job(request, job_id: int):
    serializer = BookJobSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    booking = services.book_job(provider_user=request.user, job_id=job_id, **serializer.validated_data)
    return Response({"booking_id": booking.booking_id}, status=status.HTTP_201_CREATED)


@api_view(["POST"])
def select_booking(request):
    serializer = BookingIdSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    services.select_booking(client_user=request.user, booking_id=serializer.validated_data["booking_id"])
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["POST"])
def cancel_booking(request):
    serializer = BookingIdSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    services.cancel_booking(client_user=request.user, booking_id=serializer.validated_data["booking_id"])
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["POST"])
def complete_booking(request):
    serializer = BookingIdSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    services.complete_job(provider_user=request.user, booking_id=serializer.validated_data["booking_id"])
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["POST"])
def pay_booking(request):
    serializer = CreatePaymentSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    payment = services.create_payment(client_user=request.user, **serializer.validated_data)
    return Response({"booking_id": payment.booking_id}, status=status.HTTP_201_CREATED)


@api_view(["POST"])
def review_booking(request):
    serializer = CreateReviewSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    review = services.create_review(
        client_user=request.user,
        booking_id=serializer.validated_data["booking_id"],
        rating=serializer.validated_data["rating"],
        comment=serializer.validated_data.get("comment"),
    )
    return Response({"booking_id": review.booking_id}, status=status.HTTP_201_CREATED)
