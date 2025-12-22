from django.db import models
from django.contrib.auth.models import User

from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from django.utils.timesince import timesince

class JobPosting(models.Model):
    class Category(models.TextChoices):
        RAILWAY = 'RAILWAY', _('Railway')
        BANKING = 'BANKING', _('Banking')
        SSC = 'SSC', _('SSC')
        UPSC = 'UPSC', _('UPSC')
        STATE_GOVT = 'STATE_GOVT', _('State Govt')
        TEACHING = 'TEACHING', _('Teaching')
        OTHER = 'OTHER', _('Other')

    category = models.CharField(
        max_length=20,
        choices=Category.choices,
        default=Category.RAILWAY,
    )
    
    title = models.CharField(max_length=255)
    organization = models.CharField(max_length=255)
    location = models.CharField(max_length=255, default="All India")
    vacancies = models.PositiveIntegerField()
    last_date = models.DateField()
    description = models.TextField()
    posted_at = models.DateTimeField(auto_now_add=True)
    job_link = models.URLField(blank=True, null=True)

    def __str__(self):
        return f"{self.title} ({self.get_category_display()})"
    
    @property
    def posted_ago(self):
        return f"{timesince(self.posted_at, timezone.now())} ago"

class Like(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True) # Like can be anonymous
    job_post = models.ForeignKey(JobPosting, related_name='likes', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # This prevents a user from liking the same post more than once
        unique_together = ('user', 'job_post')

class Comment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    job_post = models.ForeignKey(JobPosting, related_name='comments', on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

class Share(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True) # Share can be anonymous
    job_post = models.ForeignKey(JobPosting, related_name='shares', on_delete=models.CASCADE)
    platform = models.CharField(max_length=50, blank=True) # e.g., 'WhatsApp', 'LinkedIn'
    created_at = models.DateTimeField(auto_now_add=True)

class Bookmark(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    job_post = models.ForeignKey(JobPosting, related_name='bookmarks', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # A user can only bookmark a specific job once
        unique_together = ('user', 'job_post')

    def __str__(self):
        return f"{self.user.username} bookmarked {self.job_post.title}"