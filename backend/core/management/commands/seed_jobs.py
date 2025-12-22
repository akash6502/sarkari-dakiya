import random
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta

from core.models import JobPosting, Like, Comment, Share, Bookmark


class Command(BaseCommand):
    help = "Seed sample job postings with random likes, comments, shares, and bookmarks"

    def add_arguments(self, parser):
        parser.add_argument(
            "--count",
            type=int,
            default=10,
            help="Number of job postings to create"
        )

    def handle(self, *args, **options):
        count = options["count"]

        # ---------- Ensure users exist ----------
        users = list(User.objects.all())
        if not users:
            self.stdout.write("No users found. Creating sample users...")
            for i in range(10):
                users.append(
                    User.objects.create_user(
                        username=f"user{i}",
                        email=f"user{i}@example.com",
                        password="password123",
                    )
                )

        categories = [choice[0] for choice in JobPosting.Category.choices]

        for i in range(count):
            job = JobPosting.objects.create(
                category=random.choice(categories),
                title=f"Sample Job {i + 1}",
                organization=f"Organization {random.randint(1, 20)}",
                location="All India",
                vacancies=random.randint(10, 5000),
                last_date=timezone.now().date() + timedelta(days=random.randint(10, 60)),
                description="This is a sample job description.",
            )

            # ---------- Likes ----------
            like_users = random.sample(users, random.randint(0, min(100, len(users))))
            for user in like_users:
                Like.objects.get_or_create(user=user, job_post=job)

            # ---------- Shares ----------
            for _ in range(random.randint(0, 50)):
                Share.objects.create(
                    user=random.choice(users),
                    job_post=job,
                    platform=random.choice(["WhatsApp", "LinkedIn", "Telegram"]),
                )

            # ---------- Comments ----------
            for _ in range(random.randint(0, 30)):
                Comment.objects.create(
                    user=random.choice(users),
                    job_post=job,
                    content="This is a sample comment.",
                )

            # ---------- Bookmarks ----------
            # bookmark_users = random.sample(users, random.randint(0, min(20, len(users))))
            # for user in bookmark_users:
            #     Bookmark.objects.get_or_create(user=user, job_post=job)

            self.stdout.write(
                self.style.SUCCESS(f"Created job '{job.title}' with interactions")
            )

        self.stdout.write(self.style.SUCCESS("Seeding completed successfully!"))
