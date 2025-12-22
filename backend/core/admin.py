from django.contrib import admin
from .models import (
    JobPosting,
    Like,
    Comment,
    Share,
    Bookmark,
)

@admin.register(JobPosting)
class JobPostingAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "title",
        "organization",
        "category",
        "location",
        "vacancies",
        "last_date",
        "posted_at",
        "likes_count",
        "comments_count",
        "shares_count",
        "bookmarks_count",
    )

    list_filter = ("category", "location", "posted_at")
    search_fields = ("title", "organization", "description")
    ordering = ("-posted_at",)
    date_hierarchy = "posted_at"

    def likes_count(self, obj):
        return obj.likes.count()
    likes_count.short_description = "Likes"

    def comments_count(self, obj):
        return obj.comments.count()
    comments_count.short_description = "Comments"

    def shares_count(self, obj):
        return obj.shares.count()
    shares_count.short_description = "Shares"

    def bookmarks_count(self, obj):
        return obj.bookmarks.count()
    bookmarks_count.short_description = "Bookmarks"


@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "job_post", "created_at")
    list_filter = ("created_at",)
    search_fields = ("user__username", "job_post__title")

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "job_post", "short_content", "created_at")
    list_filter = ("created_at",)
    search_fields = ("user__username", "job_post__title", "content")

    def short_content(self, obj):
        return obj.content[:50] + ("..." if len(obj.content) > 50 else "")
    short_content.short_description = "Comment"


@admin.register(Share)
class ShareAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "job_post", "platform", "created_at")
    list_filter = ("platform", "created_at")
    search_fields = ("user__username", "job_post__title", "platform")


@admin.register(Bookmark)
class BookmarkAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "job_post", "created_at")
    list_filter = ("created_at",)
    search_fields = ("user__username", "job_post__title")
