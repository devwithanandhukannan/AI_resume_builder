from rest_framework import serializers
from .models import (
    PersonalInfo, AdditionalLink, Education,
    Experience, Skill, Project, Certification, Achievement,
)


class PersonalInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = PersonalInfo
        fields = [
            'id', 'name', 'email', 'phone', 'location',
            'linkedin', 'github', 'website',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class AdditionalLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdditionalLink
        fields = ['id', 'link_type', 'url', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = [
            'id', 'degree', 'institution',
            'start_month', 'start_year', 'end_month', 'end_year',
            'gpa', 'description', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experience
        fields = [
            'id', 'role', 'company',
            'start_month', 'start_year', 'end_month', 'end_year',
            'is_present', 'description', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, data):
        is_present = data.get('is_present', getattr(self.instance, 'is_present', False))
        end_year = data.get('end_year', getattr(self.instance, 'end_year', None))

        if not is_present and not end_year:
            raise serializers.ValidationError({
                'end_year': 'Provide end_year or set is_present to true.'
            })
        if is_present:
            data['end_month'] = ''
            data['end_year'] = None
        return data


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'name', 'category', 'level', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = [
            'id', 'title', 'description', 'technologies', 'link',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class CertificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Certification
        fields = [
            'id', 'title', 'organization', 'year', 'link',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class AchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = ['id', 'title', 'year', 'description', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']