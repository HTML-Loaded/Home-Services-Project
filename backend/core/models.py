from django.conf import settings
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password is not None:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)
        return self.create_user(email=email, password=password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    user_id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)
    DOB = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["name"]

    class Meta:
        db_table = "USER"


class ServiceProvider(models.Model):
    provider = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        primary_key=True,
        db_column="provider_id",
        related_name="service_provider",
    )
    average_rating = models.FloatField(null=True, blank=True)
    service_area = models.TextField()
    service_distance = models.FloatField(null=True, blank=True)

    class Meta:
        db_table = "SERVICE_PROVIDER"


class Category(models.Model):
    category_id = models.BigAutoField(primary_key=True)
    category_name = models.TextField(null=True, blank=True)

    class Meta:
        db_table = "CATEGORY"


class Provides(models.Model):
    provider = models.ForeignKey(
        ServiceProvider,
        on_delete=models.CASCADE,
        db_column="provider_id",
        related_name="provides",
    )
    category = models.ForeignKey(Category, on_delete=models.CASCADE, db_column="category_id")

    class Meta:
        db_table = "PROVIDES"
        constraints = [
            models.UniqueConstraint(fields=["provider", "category"], name="uniq_provider_category")
        ]


class BackgroundCheck(models.Model):
    check_id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, db_column="user_id")
    date = models.DateField(null=True, blank=True)
    report = models.TextField()

    class Meta:
        db_table = "BACKGROUND_CHECK"


class JobPosting(models.Model):
    job_id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, db_column="user_id")
    category = models.ForeignKey(Category, on_delete=models.CASCADE, db_column="category_id")
    service_area = models.TextField()
    description = models.TextField(null=True, blank=True)
    start_time = models.DateTimeField(null=True, blank=True)
    end_time = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "JOB_POSTING"


class Booking(models.Model):
    booking_id = models.BigAutoField(primary_key=True)
    job = models.ForeignKey(JobPosting, on_delete=models.CASCADE, db_column="job_id", related_name="bookings")
    provider = models.ForeignKey(
        ServiceProvider,
        on_delete=models.CASCADE,
        db_column="provider_id",
        related_name="bookings",
    )
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    comment = models.TextField(null=True, blank=True)
    status = models.TextField(null=True, blank=True)

    class Meta:
        db_table = "BOOKING"
        constraints = [
            models.UniqueConstraint(fields=["job", "provider"], name="uniq_booking_job_provider")
        ]


class Dispute(models.Model):
    dispute_id = models.BigAutoField(primary_key=True)
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, db_column="booking_id")
    claimant = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        db_column="claimant_id",
        related_name="disputes_as_claimant",
    )
    defendant = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        db_column="defendant_id",
        related_name="disputes_as_defendant",
    )
    reason = models.TextField(null=True, blank=True)
    description = models.TextField(null=True, blank=True)

    class Meta:
        db_table = "DISPUTE"


class Review(models.Model):
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, primary_key=True, db_column="booking_id")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, db_column="user_id")
    rating = models.IntegerField()
    comment = models.TextField(null=True, blank=True)
    review_date = models.DateField()

    class Meta:
        db_table = "REVIEW"


class Payment(models.Model):
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, primary_key=True, db_column="booking_id")
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_date = models.DateField()
    payment_method = models.CharField(max_length=255)

    class Meta:
        db_table = "PAYMENT"
