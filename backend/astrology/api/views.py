# Astrology API Views
# REST API views for natal chart operations

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.core.exceptions import ObjectDoesNotExist
from datetime import datetime

from api.models import Patient
from ..services.chart_service import ChartService
from ..engine.solar_arc import SolarArcEngine
from ..engine.lunar_return import LunarReturnEngine
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

class SolarArcView(APIView):
    """
    API endpoint for Solar Arc Directions calculations
    
    GET /api/therapist/patients/{patient_id}/astrology/solar-arc/
        - Calculate Solar Arc Directions for a patient
        - Requires query parameters: target_date (YYYY-MM-DD)
    """
    permission_classes = [IsAuthenticated, IsTherapist, CanAccessPatient]
    
    def get(self, request, patient_id):
        """Calculate Solar Arc Directions for patient"""
        try:
            # Verify patient exists and user has access
            patient = Patient.objects.get(id=patient_id)
            self.check_object_permissions(request, patient)
            
            # Get target date from query params
            target_date = request.query_params.get('target_date')
            if not target_date:
                # Default to current date
                target_date = datetime.now().strftime('%Y-%m-%d')
            
            # Validate date format
            try:
                datetime.strptime(target_date, '%Y-%m-%d')
            except ValueError:
                return Response(
                    {"error": "Invalid date format. Use YYYY-MM-DD"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get natal chart to extract birth data
            chart_service = ChartService()
            natal_chart = chart_service.get_natal_chart(patient_id)
            
            if not natal_chart:
                return Response(
                    {"error": "No natal chart found. Please create natal chart first."},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Extract birth data from natal chart
            birth_datetime = natal_chart.birth_datetime
            birth_data = {
                'year': birth_datetime.year,
                'month': birth_datetime.month,
                'day': birth_datetime.day,
                'hour': birth_datetime.hour,
                'minute': birth_datetime.minute
            }
            
            # Calculate Solar Arc
            solar_arc_engine = SolarArcEngine()
            solar_arc_data = solar_arc_engine.calculate_solar_arc(
                birth_data=birth_data,
                target_date=target_date
            )
            
            # Add metadata
            response_data = {
                'patient_id': patient_id,
                'birth_date': birth_datetime.strftime('%Y-%m-%d %H:%M'),
                'target_date': target_date,
                'solar_arc': solar_arc_data,
                'layer_availability': {
                    'solarArc': True
                }
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except ObjectDoesNotExist:
            return Response(
                {"error": "Patient not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except ImportError as e:
            return Response(
                {"error": f"Solar Arc calculation not available: {str(e)}"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        except Exception as e:
            return Response(
                {"error": f"Error calculating Solar Arc: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class LunarReturnView(APIView):
    """
    API endpoint for Lunar Return calculations
    
    GET /api/therapist/patients/{patient_id}/astrology/lunar-return/
        - Calculate Lunar Return for a patient in target month
        - Requires query parameters: target_month (YYYY-MM)
        
    A Lunar Return is the moment when the Moon returns to its exact natal position.
    This occurs approximately every 27.3 days (sidereal month).
    """
    permission_classes = [IsAuthenticated, IsTherapist, CanAccessPatient]
    
    def get(self, request, patient_id):
        """Calculate Lunar Return for patient in target month"""
        try:
            # Verify patient exists and user has access
            patient = Patient.objects.get(id=patient_id)
            self.check_object_permissions(request, patient)
            
            # Get target month from query params
            target_month = request.query_params.get('target_month')
            if not target_month:
                # Default to current month
                target_month = datetime.now().strftime('%Y-%m')
            
            # Validate month format
            try:
                datetime.strptime(target_month, '%Y-%m')
            except ValueError:
                return Response(
                    {"error": "Invalid month format. Use YYYY-MM"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get natal chart to extract birth data
            chart_service = ChartService()
            natal_chart = chart_service.get_natal_chart(patient_id)
            
            if not natal_chart:
                return Response(
                    {"error": "No natal chart found. Please create natal chart first."},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Extract birth data from natal chart
            birth_datetime = natal_chart.birth_datetime
            latitude = natal_chart.latitude
            longitude = natal_chart.longitude
            timezone = natal_chart.timezone or 'UTC'
            house_system = natal_chart.house_system or 'P'
            zodiac_type = natal_chart.zodiac_type or 'T'
            
            # Calculate Lunar Return
            lunar_return_engine = LunarReturnEngine()
            lunar_return_data = lunar_return_engine.calculate_lunar_return(
                patient_id=patient_id,
                birth_datetime=birth_datetime,
                latitude=latitude,
                longitude=longitude,
                target_month=target_month,
                timezone=timezone,
                house_system=house_system,
                zodiac_type=zodiac_type
            )
            
            # Add metadata
            response_data = {
                'patient_id': patient_id,
                'birth_date': birth_datetime.strftime('%Y-%m-%d %H:%M'),
                'target_month': target_month,
                'lunar_return': lunar_return_data,
                'layer_availability': {
                    'lunarReturn': True
                }
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except ObjectDoesNotExist:
            return Response(
                {"error": "Patient not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except ValueError as e:
            return Response(
                {"error": f"Lunar Return calculation error: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        except ImportError as e:
            return Response(
                {"error": f"Lunar Return calculation not available: {str(e)}"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        except Exception as e:
            return Response(
                {"error": f"Error calculating Lunar Return: {str(e)}"},
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