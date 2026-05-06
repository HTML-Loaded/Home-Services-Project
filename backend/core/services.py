from django.db import transaction
from django.db.models import Avg
from django.utils import timezone

from .models import Booking, Category, JobPosting, Payment, Provides, Review, ServiceProvider, User


def validate_job_posting(category_id, service_area, start_time, end_time):
    if category_id is None:
        raise ValueError("Category required")
    if not service_area:
        raise ValueError("Service Area required")
    if start_time is None or end_time is None:
        raise ValueError("Time slot is required.")
    if end_time <= start_time:
        raise ValueError("End time must be after start time.")


def validate_review(rating, comment):
    if rating < 1 or rating > 5:
        raise ValueError("Rating must be between 1 and 5")
    if comment is not None and len(comment) > 1000:
        raise ValueError("Comment exceeds 1000 characters")


def validate_payment_amount(amount, booking_price):
    if amount <= 0:
        raise ValueError("Amount must be positive")
    if booking_price is not None and amount != booking_price:
        raise ValueError("Amount does not match booking price")


def get_user_profile(user_id):
    return User.objects.get(user_id=user_id)


def get_provider_list(category_id, service_area):
    return (
        ServiceProvider.objects.filter(service_area=service_area, provides__category_id=category_id)
        .select_related("provider")
        .order_by("-average_rating")
    )


def get_postings(category_id, service_area):
    return JobPosting.objects.filter(category_id=category_id, service_area=service_area)


def get_bookings_for_job(job_id):
    return Booking.objects.filter(job_id=job_id)


@transaction.atomic
def create_user(name, email, password, DOB=None):
    if User.objects.filter(email=email).exists():
        raise ValueError("User with this email already exists")
    return User.objects.create_user(name=name, email=email, password=password, DOB=DOB, is_active=True)


@transaction.atomic
def become_provider(user, service_area, service_distance=None):
    if ServiceProvider.objects.filter(provider=user).exists():
        raise ValueError("User is already registered as a provider")
    return ServiceProvider.objects.create(
        provider=user,
        service_area=service_area,
        service_distance=service_distance,
        average_rating=0,
    )


@transaction.atomic
def set_provider_categories(user, category_ids):
    provider = ServiceProvider.objects.get(provider=user)
    Provides.objects.filter(provider=provider).delete()
    categories = Category.objects.filter(category_id__in=category_ids)
    Provides.objects.bulk_create([Provides(provider=provider, category=category) for category in categories])


@transaction.atomic
def create_job_posting(user, category_id, service_area, description=None, start_time=None, end_time=None):
    validate_job_posting(category_id=category_id, service_area=service_area, start_time=start_time, end_time=end_time)
    category = Category.objects.get(category_id=category_id)
    return JobPosting.objects.create(
        user=user,
        category=category,
        service_area=service_area,
        description=description,
        start_time=start_time,
        end_time=end_time,
    )


@transaction.atomic
def book_job(provider_user, job_id, price=None, comment=None):
    provider = ServiceProvider.objects.get(provider=provider_user)
    job = JobPosting.objects.get(job_id=job_id)
    if job.user_id == provider_user.user_id:
        raise ValueError("Provider cannot book own job")

    existing = Booking.objects.filter(job=job, provider=provider).exclude(status="CANCELLED").first()
    if existing is not None:
        raise ValueError("Provider already booked this job")

    return Booking.objects.create(job=job, provider=provider, price=price, comment=comment, status="PENDING")


@transaction.atomic
def select_booking(client_user, booking_id):
    booking = Booking.objects.select_related("job").get(booking_id=booking_id)
    if booking.job.user_id != client_user.user_id:
        raise ValueError("Forbidden")
    if booking.status != "PENDING":
        raise ValueError("Invalid state")

    Booking.objects.filter(booking_id=booking_id).update(status="ACCEPTED")
    Booking.objects.filter(job=booking.job, status="PENDING").exclude(booking_id=booking_id).update(status="REJECTED")


@transaction.atomic
def cancel_booking(client_user, booking_id):
    booking = Booking.objects.select_related("job").get(booking_id=booking_id)
    if booking.job.user_id != client_user.user_id:
        raise ValueError("Forbidden")
    if booking.status in {"COMPLETED", "CANCELLED"}:
        raise ValueError("Invalid state")

    Booking.objects.filter(booking_id=booking_id).update(status="CANCELLED")


@transaction.atomic
def complete_job(provider_user, booking_id):
    booking = Booking.objects.select_related("provider").get(booking_id=booking_id)
    if booking.provider_id != provider_user.user_id:
        raise ValueError("Forbidden")
    if booking.status != "ACCEPTED":
        raise ValueError("Invalid state")

    Booking.objects.filter(booking_id=booking_id).update(status="COMPLETED")


@transaction.atomic
def create_payment(client_user, booking_id, amount, payment_method):
    booking = Booking.objects.select_related("job").get(booking_id=booking_id)
    if booking.job.user_id != client_user.user_id:
        raise ValueError("Forbidden")
    if booking.status != "COMPLETED":
        raise ValueError("Payment requires completed booking")

    validate_payment_amount(amount=amount, booking_price=booking.price)

    if Payment.objects.filter(booking=booking).exists():
        raise ValueError("This booking has been paid for")

    return Payment.objects.create(
        booking=booking,
        amount=amount,
        payment_date=timezone.now().date(),
        payment_method=payment_method,
    )


@transaction.atomic
def create_review(client_user, booking_id, rating, comment=None):
    validate_review(rating=rating, comment=comment)

    booking = Booking.objects.select_related("job", "provider").get(booking_id=booking_id)
    if booking.job.user_id != client_user.user_id:
        raise ValueError("Forbidden")
    if booking.status != "COMPLETED":
        raise ValueError("Review requires completed booking")

    if Review.objects.filter(booking=booking).exists():
        raise ValueError("This booking has already been reviewed")

    review = Review.objects.create(
        booking=booking,
        user=client_user,
        rating=rating,
        comment=comment,
        review_date=timezone.now().date(),
    )

    avg_rating = (
        Review.objects.filter(booking__provider=booking.provider).aggregate(avg=Avg("rating"))["avg"]
    )
    ServiceProvider.objects.filter(provider=booking.provider.provider).update(average_rating=avg_rating)

    return review
