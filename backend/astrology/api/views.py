# Astrology API Views
# REST API views for natal chart operations

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.core.exceptions import ObjectDoesNotExist

from api.models import Patient
from ..services.chart_service import ChartService
from ..api.serializers import (
    NatalChartSerializer,
    NatalChartRequestSerializer,
    NatalChartUpdateSerializer
)
from ..api.permissions import IsTherapist, CanAccessPatient


class NatalChartView(APIView):
    """
    API endpoint for natal chart operations

    GET /api/therapist/patients/{patient_id}/astrology/natal-chart/
        - Get natal chart for patient
    POST /api/therapist/patients/{patient_id}/astrology/natal-chart/
        - Create or recalculate natal chart for patient
    PUT /api/therapist/patients/{patient_id}/astrology/natal-chart/
        - Update natal chart parameters
    DELETE /api/therapist/patients/{patient_id}/astrology/natal-chart/
        - Delete natal chart for patient
    """
    permission_classes = [IsAuthenticated, IsTherapist, CanAccessPatient]

    def get(self, request, patient_id):
        """Get natal chart for patient"""
        try:
            # Verify patient exists and user has access
            patient = Patient.objects.get(id=patient_id)
            self.check_object_permissions(request, patient)

            # Get natal chart
            chart_service = ChartService()
            chart = chart_service.get_natal_chart(patient_id)

            if not chart:
                return Response(
                    {"error": "No natal chart found for this patient"},
                    status=status.HTTP_404_NOT_FOUND
                )

            serializer = NatalChartSerializer(chart)
            return Response(serializer.data)

        except ObjectDoesNotExist:
            return Response(
                {"error": "Patient not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": f"Error retrieving natal chart: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def post(self, request, patient_id):
        """Create or recalculate natal chart for patient"""
        try:
            # Verify patient exists and user has access
            patient = Patient.objects.get(id=patient_id)
            self.check_object_permissions(request, patient)

            # Validate request data
            request_serializer = NatalChartRequestSerializer(data=request.data)
            if not request_serializer.is_valid():
                return Response(
                    request_serializer.errors,
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Extract parameters
            data = request_serializer.validated_data

            # Verify patient_id matches URL parameter
            if data['patient_id'] != patient_id:
                return Response(
                    {"error": "Patient ID mismatch"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Calculate or get existing chart
            chart_service = ChartService()
            chart = chart_service.get_or_create_natal_chart(
                patient_id=data['patient_id'],
                birth_datetime=data['birth_datetime'],
                latitude=data['latitude'],
                longitude=data['longitude'],
                timezone=data.get('timezone', 'UTC'),
                house_system=data.get('house_system', 'P'),
                zodiac_type=data.get('zodiac_type', 'T'),
                include_minor_aspects=data.get('include_minor_aspects', False)
            )

            serializer = NatalChartSerializer(chart)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except ObjectDoesNotExist:
            return Response(
                {"error": "Patient not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": f"Error calculating natal chart: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def put(self, request, patient_id):
        """Update natal chart parameters"""
        try:
            # Verify patient exists and user has access
            patient = Patient.objects.get(id=patient_id)
            self.check_object_permissions(request, patient)

            # Validate request data
            update_serializer = NatalChartUpdateSerializer(data=request.data)
            if not update_serializer.is_valid():
                return Response(
                    update_serializer.errors,
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Update chart parameters
            chart_service = ChartService()
            data = update_serializer.validated_data

            chart = chart_service.update_natal_chart_parameters(
                patient_id=patient_id,
                house_system=data.get('house_system'),
                zodiac_type=data.get('zodiac_type'),
                include_minor_aspects=data.get('include_minor_aspects')
            )

            if not chart:
                return Response(
                    {"error": "No natal chart found to update"},
                    status=status.HTTP_404_NOT_FOUND
                )

            serializer = NatalChartSerializer(chart)
            return Response(serializer.data)

        except ObjectDoesNotExist:
            return Response(
                {"error": "Patient not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": f"Error updating natal chart: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def delete(self, request, patient_id):
        """Delete natal chart for patient"""
        try:
            # Verify patient exists and user has access
            patient = Patient.objects.get(id=patient_id)
            self.check_object_permissions(request, patient)

            # Delete natal chart
            chart_service = ChartService()
            deleted = chart_service.delete_natal_chart(patient_id)

            if not deleted:
                return Response(
                    {"error": "No natal chart found to delete"},
                    status=status.HTTP_404_NOT_FOUND
                )

            return Response(
                {"message": "Natal chart deleted successfully"},
                status=status.HTTP_204_NO_CONTENT
            )

        except ObjectDoesNotExist:
            return Response(
                {"error": "Patient not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": f"Error deleting natal chart: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )