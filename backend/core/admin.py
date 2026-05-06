from django.contrib import admin

from .models import (
    BackgroundCheck,
    Booking,
    Category,
    Dispute,
    JobPosting,
    Payment,
    Provides,
    Review,
    ServiceProvider,
    User,
)

admin.site.register(User)
admin.site.register(ServiceProvider)
admin.site.register(Category)
admin.site.register(Provides)
admin.site.register(BackgroundCheck)
admin.site.register(JobPosting)
admin.site.register(Booking)
admin.site.register(Dispute)
admin.site.register(Review)
admin.site.register(Payment)
