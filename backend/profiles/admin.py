from django.contrib import admin
from .models import (
    PersonalInfo, AdditionalLink, Education,
    Experience, Skill, Project, Certification, Achievement,
)


@admin.register(PersonalInfo)
class PersonalInfoAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'phone', 'location', 'user')
    search_fields = ('name', 'email', 'user__username')


@admin.register(AdditionalLink)
class AdditionalLinkAdmin(admin.ModelAdmin):
    list_display = ('link_type', 'url', 'user')
    list_filter = ('link_type',)


@admin.register(Education)
class EducationAdmin(admin.ModelAdmin):
    list_display = ('degree', 'institution', 'start_year', 'end_year', 'user')
    list_filter = ('start_year',)


@admin.register(Experience)
class ExperienceAdmin(admin.ModelAdmin):
    list_display = ('role', 'company', 'start_year', 'is_present', 'user')
    list_filter = ('is_present',)


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'level', 'user')
    list_filter = ('level', 'category')


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'technologies', 'user')


@admin.register(Certification)
class CertificationAdmin(admin.ModelAdmin):
    list_display = ('title', 'organization', 'year', 'user')
    list_filter = ('year',)


@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = ('title', 'year', 'user')
    list_filter = ('year',)