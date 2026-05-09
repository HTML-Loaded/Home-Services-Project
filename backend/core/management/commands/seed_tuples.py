from django.core.management.base import BaseCommand
from django.utils import timezone

from core.models import (
    BackgroundCheck,
    Booking,
    Category,
    JobPosting,
    Payment,
    Provides,
    Review,
    ServiceProvider,
    User,
)


class Command(BaseCommand):
    def handle(self, *args, **options):
        category_names = [
            "Electrician",
            "Plumber",
            "Carpenter",
            "Painter",
            "Landscaper",
            "House Cleaner",
            "HVAC",
            "Handyman",
            "Appliance Repair",
            "Roofing",
            "Plumbing",
            "Home Cleaning",
            "HVAC (Cooling/Heating)",
            "Electrical Appliances",
        ]

        created_categories = 0
        categories_by_name = {}
        for name in category_names:
            category, was_created = Category.objects.get_or_create(category_name=name)
            categories_by_name[name] = category
            if was_created:
                created_categories += 1

        users_payload = [
            {
                "name": "Joe Ramirez",
                "email": "joe.plumber@example.com",
                "password": "TempPass123!",
                "DOB": "1986-03-14",
            },
            {
                "name": "Jane Nguyen",
                "email": "jane.cleaner@example.com",
                "password": "TempPass123!",
                "DOB": "1992-09-08",
            },
            {
                "name": "Mike Torres",
                "email": "mike.electric@example.com",
                "password": "TempPass123!",
                "DOB": "1984-01-22",
            },
            {
                "name": "Paul Jackson",
                "email": "paul.home@example.com",
                "password": "TempPass123!",
                "DOB": "1990-06-11",
            },
            {
                "name": "Kassie Flores",
                "email": "kassie.home@example.com",
                "password": "TempPass123!",
                "DOB": "1995-12-02",
            },
            {
                "name": "Joey Alvarez",
                "email": "joey.rentals@example.com",
                "password": "TempPass123!",
                "DOB": "1981-04-30",
            },
        ]

        users_by_email = {}
        created_users = 0
        for payload in users_payload:
            user = User.objects.filter(email=payload["email"]).first()
            if user is None:
                user = User.objects.create_user(
                    email=payload["email"],
                    password=payload["password"],
                    name=payload["name"],
                    DOB=payload["DOB"],
                )
                created_users += 1
            users_by_email[payload["email"]] = user

        service_providers_payload = [
            {
                "email": "joe.plumber@example.com",
                "average_rating": 4.7,
                "service_area": "Edinburg, TX",
                "service_distance": 50.0,
            },
            {
                "email": "jane.cleaner@example.com",
                "average_rating": 4.9,
                "service_area": "McAllen, TX",
                "service_distance": 20.0,
            },
            {
                "email": "mike.electric@example.com",
                "average_rating": 4.6,
                "service_area": "Brownsville, TX",
                "service_distance": 35.0,
            },
        ]

        providers_by_email = {}
        created_providers = 0
        for payload in service_providers_payload:
            user = users_by_email[payload["email"]]
            provider, was_created = ServiceProvider.objects.get_or_create(
                provider=user,
                defaults={
                    "average_rating": payload["average_rating"],
                    "service_area": payload["service_area"],
                    "service_distance": payload["service_distance"],
                },
            )
            if not was_created:
                ServiceProvider.objects.filter(provider=user).update(
                    average_rating=payload["average_rating"],
                    service_area=payload["service_area"],
                    service_distance=payload["service_distance"],
                )
            providers_by_email[payload["email"]] = provider
            if was_created:
                created_providers += 1

        provides_payload = [
            {"email": "joe.plumber@example.com", "category": "Plumbing"},
            {"email": "jane.cleaner@example.com", "category": "Home Cleaning"},
            {"email": "mike.electric@example.com", "category": "HVAC (Cooling/Heating)"},
            {"email": "mike.electric@example.com", "category": "Electrical Appliances"},
        ]

        created_provides = 0
        for payload in provides_payload:
            provider = providers_by_email[payload["email"]]
            category = categories_by_name[payload["category"]]
            _, was_created = Provides.objects.get_or_create(provider=provider, category=category)
            if was_created:
                created_provides += 1

        background_checks_payload = [
            {
                "email": "joe.plumber@example.com",
                "date": "2026-04-10",
                "report": "Clear. No criminal records found.",
            },
            {
                "email": "jane.cleaner@example.com",
                "date": "2026-04-12",
                "report": "Clear. ID verified and address confirmed.",
            },
            {
                "email": "mike.electric@example.com",
                "date": "2026-04-15",
                "report": "Clear. Business registration verified.",
            },
        ]

        created_checks = 0
        for payload in background_checks_payload:
            user = users_by_email[payload["email"]]
            _, was_created = BackgroundCheck.objects.get_or_create(
                user=user,
                report=payload["report"],
                defaults={"date": payload["date"]},
            )
            if was_created:
                created_checks += 1

        job_postings_payload = [
            {
                "key": "paul_leak",
                "email": "paul.home@example.com",
                "category": "Plumbing",
                "service_area": "McAllen, TX",
                "description": "Water dripping from living room ceiling; need urgent leak diagnosis and repair.",
                "start": "2026-05-10T10:00:00",
                "end": "2026-05-10T12:00:00",
            },
            {
                "key": "kassie_clean",
                "email": "kassie.home@example.com",
                "category": "Home Cleaning",
                "service_area": "McAllen, TX",
                "description": "Need trustworthy home cleaning twice a week; newborn at home.",
                "start": "2026-05-11T09:00:00",
                "end": "2026-05-11T11:00:00",
            },
            {
                "key": "joey_ac",
                "email": "joey.rentals@example.com",
                "category": "HVAC (Cooling/Heating)",
                "service_area": "Edinburg, TX",
                "description": "Rental property AC not cooling; need service without emergency upcharge if possible.",
                "start": "2026-07-15T14:00:00",
                "end": "2026-07-15T16:00:00",
            },
        ]

        jobs_by_key = {}
        created_jobs = 0
        for payload in job_postings_payload:
            user = users_by_email[payload["email"]]
            category = categories_by_name[payload["category"]]
            start_time = timezone.make_aware(timezone.datetime.fromisoformat(payload["start"]))
            end_time = timezone.make_aware(timezone.datetime.fromisoformat(payload["end"]))
            job, was_created = JobPosting.objects.get_or_create(
                user=user,
                category=category,
                service_area=payload["service_area"],
                description=payload["description"],
                defaults={"start_time": start_time, "end_time": end_time},
            )
            if not was_created:
                JobPosting.objects.filter(job_id=job.job_id).update(start_time=start_time, end_time=end_time)
            jobs_by_key[payload["key"]] = job
            if was_created:
                created_jobs += 1

        bookings_payload = [
            {
                "job_key": "paul_leak",
                "provider_email": "joe.plumber@example.com",
                "price": "175.00",
                "comment": "Can arrive within 60 minutes.",
                "status": "confirmed",
            },
            {
                "job_key": "kassie_clean",
                "provider_email": "jane.cleaner@example.com",
                "price": "120.00",
                "comment": "Comfortable with newborn-safe supplies.",
                "status": "confirmed",
            },
            {
                "job_key": "joey_ac",
                "provider_email": "mike.electric@example.com",
                "price": "160.00",
                "comment": "Available same day; standard rate.",
                "status": "confirmed",
            },
        ]

        bookings_by_job_key = {}
        created_bookings = 0
        for payload in bookings_payload:
            job = jobs_by_key[payload["job_key"]]
            provider = providers_by_email[payload["provider_email"]]
            booking, was_created = Booking.objects.get_or_create(
                job=job,
                provider=provider,
                defaults={
                    "price": payload["price"],
                    "comment": payload["comment"],
                    "status": payload["status"],
                },
            )
            if not was_created:
                Booking.objects.filter(booking_id=booking.booking_id).update(
                    price=payload["price"],
                    comment=payload["comment"],
                    status=payload["status"],
                )
            bookings_by_job_key[payload["job_key"]] = booking
            if was_created:
                created_bookings += 1

        reviews_payload = [
            {
                "job_key": "paul_leak",
                "reviewer_email": "paul.home@example.com",
                "rating": 5,
                "comment": "Fixed the leak quickly and explained everything.",
                "review_date": "2026-05-10",
            },
            {
                "job_key": "kassie_clean",
                "reviewer_email": "kassie.home@example.com",
                "rating": 5,
                "comment": "Very professional and trustworthy.",
                "review_date": "2026-05-11",
            },
            {
                "job_key": "joey_ac",
                "reviewer_email": "joey.rentals@example.com",
                "rating": 4,
                "comment": "Solved the issue fast; good communication.",
                "review_date": "2026-07-15",
            },
        ]

        created_reviews = 0
        for payload in reviews_payload:
            booking = bookings_by_job_key[payload["job_key"]]
            reviewer = users_by_email[payload["reviewer_email"]]
            review, was_created = Review.objects.get_or_create(
                booking=booking,
                defaults={
                    "user": reviewer,
                    "rating": payload["rating"],
                    "comment": payload["comment"],
                    "review_date": payload["review_date"],
                },
            )
            if not was_created:
                Review.objects.filter(booking=booking).update(
                    user=reviewer,
                    rating=payload["rating"],
                    comment=payload["comment"],
                    review_date=payload["review_date"],
                )
            if was_created:
                created_reviews += 1

        payments_payload = [
            {
                "job_key": "paul_leak",
                "amount": "175.00",
                "payment_date": "2026-05-10",
                "payment_method": "card",
            },
            {
                "job_key": "kassie_clean",
                "amount": "120.00",
                "payment_date": "2026-05-11",
                "payment_method": "card",
            },
            {
                "job_key": "joey_ac",
                "amount": "160.00",
                "payment_date": "2026-07-15",
                "payment_method": "cash",
            },
        ]

        created_payments = 0
        for payload in payments_payload:
            booking = bookings_by_job_key[payload["job_key"]]
            _, was_created = Payment.objects.get_or_create(
                booking=booking,
                defaults={
                    "amount": payload["amount"],
                    "payment_date": payload["payment_date"],
                    "payment_method": payload["payment_method"],
                },
            )
            if not was_created:
                Payment.objects.filter(booking=booking).update(
                    amount=payload["amount"],
                    payment_date=payload["payment_date"],
                    payment_method=payload["payment_method"],
                )
            if was_created:
                created_payments += 1

        self.stdout.write(
            "Seed complete. "
            f"Categories +{created_categories}, Users +{created_users}, Providers +{created_providers}, "
            f"Provides +{created_provides}, Checks +{created_checks}, Jobs +{created_jobs}, "
            f"Bookings +{created_bookings}, Reviews +{created_reviews}, Payments +{created_payments}."
        )
