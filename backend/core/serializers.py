from rest_framework import serializers
from django.contrib.auth.models import User
from .models import JobPosting, Like
from rest_framework_simplejwt.tokens import RefreshToken

from rest_framework import serializers
from django.contrib.auth import get_user_model


User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'username', 'password', 'email')

    def create(self, validated_data):
        user = User.objects.create_user(
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            username=validated_data['email'],
            email=validated_data.get('email'),
            password=validated_data['password']
        )
        return user

class JobPostingSerializer(serializers.ModelSerializer):
    likes_count = serializers.IntegerField(source='likes.count', read_only=True)
    comments_count = serializers.IntegerField(source='comments.count', read_only=True)
    shares_count = serializers.IntegerField(source='shares.count', read_only=True)
    
    # Check if the current logged-in user has liked this post
    user_has_liked = serializers.SerializerMethodField()
    is_bookmarked = serializers.SerializerMethodField()

    class Meta:
        model = JobPosting
        fields = '__all__'

    def get_user_has_liked(self, obj):
        user = self.context.get('request').user
        if user.is_authenticated:
            return Like.objects.filter(job_post=obj, user=user).exists()
        return False
    
    def get_is_bookmarked(self, obj):
        user = self.context.get('request').user
        if user.is_authenticated:
            return obj.bookmarks.filter(user=user).exists()
        return False

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    role = serializers.CharField()

    def validate(self, data):
        email = data.get("email")
        password = data.get("password")
        role = data.get("role")

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid email or password")

        if not user.check_password(password):
            raise serializers.ValidationError("Invalid email or password")

        if not user.is_active:
            raise serializers.ValidationError("Account is inactive")

        if role == 'admin' and not user.is_staff:
            raise serializers.ValidationError("You're Not an Admin")

        refresh = RefreshToken.for_user(user)

        return {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": {
                "email": user.email,
                "username": user.username,
                "first_name": user.first_name,
                "last_name": user.last_name,
            }
        }

class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()

    def validate(self, attrs):
        self.token = attrs["refresh"]
        return attrs

    def save(self, **kwargs):
        try:
            token = RefreshToken(self.token)
            token.blacklist()
        except Exception:
            raise serializers.ValidationError("Invalid or expired token")

class TrendingJobSerializer(serializers.ModelSerializer):
    likes_count = serializers.IntegerField(read_only=True)
    posted_at = serializers.DateTimeField(
        format="%Y-%m-%d",
        read_only=True
    )

    class Meta:
        model = JobPosting
        fields = [
            "id",
            "title",
            "organization",
            "category",
            "location",
            "vacancies",
            "last_date",
            "description",
            "posted_at",
            "likes_count",
        ]


class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = [
            "id",
            "first_name",
            "last_name",
            "email",
            "username",
            "is_active",
            "is_staff",
            "date_joined",
        ]