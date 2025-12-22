from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from django.db.models import Count

from core.models import JobPosting, Bookmark
from .serializers import JobPostingSerializer, LogoutSerializer, RegisterSerializer, TrendingJobSerializer, UserSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import LoginSerializer
from rest_framework.views import APIView
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

class RegisterView(generics.GenericAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

    def post(self, request, *args, **kwargs):
        # get_serializer is available because we inherited from GenericAPIView
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        return Response({
            "user": RegisterSerializer(user, context=self.get_serializer_context()).data,
            "message": "User Created Successfully. Now perform Login to get your token",
        }, status=status.HTTP_201_CREATED)

@method_decorator(csrf_exempt, name="dispatch")
class LoginView(TokenObtainPairView, APIView):
    serializer_class = LoginSerializer
    permission_classes = (AllowAny,)
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        return Response(
            {
                "message": "Login successful",
                "data": serializer.validated_data
            },
            status=status.HTTP_200_OK
        )

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = LogoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            {"message": "Logout successful"},
            status=status.HTTP_200_OK
        )

class TrendingJobsView(APIView):
    """
    Returns top 10 job posts ordered by number of likes (high → low)
    """

    def get(self, request):
        trending_jobs = (
            JobPosting.objects
            .annotate(likes_count=Count("likes"))
            .order_by("-likes_count", "-posted_at")[:10]
        )

        serializer = TrendingJobSerializer(trending_jobs, many=True)

        return Response(
            {
                "message": "Trending jobs fetched successfully",
                "count": len(serializer.data),
                "data": serializer.data,
            },
            status=status.HTTP_200_OK
        )

class JobListAPIView(APIView):
    """
    GET /api/jobs/
    GET /api/jobs/?category=BANKING
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        category = request.query_params.get("category")

        queryset = JobPosting.objects.annotate(
            likes_count=Count("likes")
        ).order_by("-posted_at")

        if category:
            queryset = queryset.filter(category=category)

        serializer = JobPostingSerializer(queryset, many=True, context={"request": request})
        return Response(
            {
                "status": "success",
                "count": queryset.count(),
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )


class BookmarkJobAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, job_id):
        user = request.user
        job = get_object_or_404(JobPosting, id=job_id)

        bookmark, created = Bookmark.objects.get_or_create(
            user=user,
            job_post=job
        )

        if not created:
            bookmark.delete()
            return Response(
                {
                    "status": "success",
                    "message": "Bookmark removed",
                    "bookmarked": False
                },
                status=status.HTTP_200_OK
            )

        return Response(
            {
                "status": "success",
                "message": "Job bookmarked",
                "bookmarked": True
            },
            status=status.HTTP_201_CREATED
        )

class UserProfileAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(
            {
                "status": "success",
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )