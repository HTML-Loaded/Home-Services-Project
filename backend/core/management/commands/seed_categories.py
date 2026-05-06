from django.core.management.base import BaseCommand

from core.models import Category


class Command(BaseCommand):
    def handle(self, *args, **options):
        names = [
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
        ]

        created = 0
        for name in names:
            _, was_created = Category.objects.get_or_create(category_name=name)
            if was_created:
                created += 1

        self.stdout.write(f"Seeded categories. Added {created} new.")
