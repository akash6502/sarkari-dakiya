from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import BookmarkJobAPIView, JobListAPIView, RegisterView, LoginView, LogoutView, TrendingJobsView, UserProfileAPIView # You will create this next

urlpatterns = [
    # Authentication URLs
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('login/', LoginView.as_view(), name='login'),
    path("logout/", LogoutView.as_view(), name="logout"),

    # Job URLs 
    path("jobs/", JobListAPIView.as_view(), name="job-list"),
    path("trending/", TrendingJobsView.as_view(), name="trending-jobs"),
    path("jobs/<int:job_id>/bookmark/", BookmarkJobAPIView.as_view(), name="bookmark-job"),

    # User
    path("profile/", UserProfileAPIView.as_view(), name="user-profile"),

    # JWT Token Refresh 
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]