from rest_framework import serializers

from .models import Booking, Category, Dispute, JobPosting, Payment, Provides, Review, ServiceProvider, User


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["user_id", "name", "email", "password", "DOB"]

    def create(self, validated_data):
        password = validated_data.pop("password")
        return User.objects.create_user(password=password, **validated_data)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["user_id", "name", "email", "DOB", "is_active"]


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["category_id", "category_name"]


class ServiceProviderSerializer(serializers.ModelSerializer):
    provider = UserSerializer(read_only=True)

    class Meta:
        model = ServiceProvider
        fields = ["provider", "average_rating", "service_area", "service_distance"]


class ProvidesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Provides
        fields = ["provider", "category"]


class BecomeProviderSerializer(serializers.Serializer):
    service_area = serializers.CharField()
    service_distance = serializers.FloatField(required=False, allow_null=True)


class SetProviderCategoriesSerializer(serializers.Serializer):
    category_ids = serializers.ListField(child=serializers.IntegerField(), allow_empty=False)


class JobPostingSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobPosting
        fields = [
            "job_id",
            "user",
            "category",
            "service_area",
            "description",
            "start_time",
            "end_time",
        ]
        read_only_fields = ["user"]


class JobPostingCreateSerializer(serializers.Serializer):
    category_id = serializers.IntegerField()
    service_area = serializers.CharField()
    description = serializers.CharField(required=False, allow_blank=True)
    start_time = serializers.DateTimeField()
    end_time = serializers.DateTimeField()


class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ["booking_id", "job", "provider", "price", "comment", "status"]
        read_only_fields = ["provider", "status"]


class BookJobSerializer(serializers.Serializer):
    price = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    comment = serializers.CharField(required=False, allow_blank=True)


class BookingIdSerializer(serializers.Serializer):
    booking_id = serializers.IntegerField()


class CreatePaymentSerializer(serializers.Serializer):
    booking_id = serializers.IntegerField()
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    payment_method = serializers.CharField()


class CreateReviewSerializer(serializers.Serializer):
    booking_id = serializers.IntegerField()
    rating = serializers.IntegerField()
    comment = serializers.CharField(required=False, allow_blank=True)


class CreateDisputeSerializer(serializers.Serializer):
    booking_id = serializers.IntegerField()
    reason = serializers.CharField(required=False, allow_blank=True)
    description = serializers.CharField(required=False, allow_blank=True)


class DisputeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dispute
        fields = ["dispute_id", "booking", "claimant", "defendant", "reason", "description"]
        read_only_fields = ["dispute_id", "claimant", "defendant"]