from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import PersonalInfo
from .interview_service import generate_interview_questions, check_aptitude_answers


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_questions(request):
    """
    POST /api/interview/generate/
    Generate interview questions based on type.
    """
    job_description = request.data.get('job_description', '')
    question_type = request.data.get('question_type', 'hr')
    count = request.data.get('count', 10)
    difficulty = request.data.get('difficulty', 'medium')

    if not job_description or len(job_description) < 10:
        return Response({
            'status': 'error',
            'message': 'Job description is required.',
        }, status=status.HTTP_400_BAD_REQUEST)

    valid_types = ['aptitude', 'hr', 'technical', 'behavioral', 'mock']
    if question_type not in valid_types:
        return Response({
            'status': 'error',
            'message': f'Invalid type. Choose from: {", ".join(valid_types)}',
        }, status=status.HTTP_400_BAD_REQUEST)

    if not PersonalInfo.objects.filter(user=request.user).exists():
        return Response({
            'status': 'error',
            'message': 'Please add your personal information first.',
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        count = min(int(count), 20)
    except (ValueError, TypeError):
        count = 10

    try:
        data = generate_interview_questions(
            user=request.user,
            job_description=job_description,
            question_type=question_type,
            count=count,
            difficulty=difficulty,
        )

        return Response({
            'status': 'success',
            'message': f'{question_type.title()} questions generated!',
            'question_type': question_type,
            'data': data,
        })

    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e),
        }, status=status.HTTP_503_SERVICE_UNAVAILABLE)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def check_answers(request):
    """
    POST /api/interview/check-answers/
    Check aptitude test answers.
    """
    questions = request.data.get('questions', [])
    user_answers = request.data.get('user_answers', {})

    if not questions or not user_answers:
        return Response({
            'status': 'error',
            'message': 'Questions and answers are required.',
        }, status=status.HTTP_400_BAD_REQUEST)

    results = check_aptitude_answers(questions, user_answers)

    return Response({
        'status': 'success',
        'message': 'Answers checked!',
        'results': results,
    })