from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import PersonalInfo
from .email_service import generate_cold_email


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_email(request):
    """
    POST /api/email/generate/
    Generate a cold email based on job description.
    """
    job_description = request.data.get('job_description', '')
    company_name = request.data.get('company_name', '')
    recipient_name = request.data.get('recipient_name', '')
    tone = request.data.get('tone', 'professional')
    email_type = request.data.get('email_type', 'application')

    if not job_description or len(job_description) < 10:
        return Response({
            'status': 'error',
            'message': 'Job description is required (min 10 characters).',
        }, status=status.HTTP_400_BAD_REQUEST)

    if not PersonalInfo.objects.filter(user=request.user).exists():
        return Response({
            'status': 'error',
            'message': 'Please add your personal information first.',
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        email_data = generate_cold_email(
            user=request.user,
            job_description=job_description,
            company_name=company_name,
            recipient_name=recipient_name,
            tone=tone,
            email_type=email_type,
        )

        return Response({
            'status': 'success',
            'message': 'Email generated successfully!',
            'email_data': email_data,
        })

    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e),
        }, status=status.HTTP_503_SERVICE_UNAVAILABLE)