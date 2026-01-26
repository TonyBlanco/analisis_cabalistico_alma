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
from ..engine.composite_chart import CompositeChartEngine
from ..engine.davison_chart import DavisonChartEngine
from ..engine.transits import TransitsEngine
from ..engine.progressions import ProgressionsEngine
from ..engine.solar_return import SolarReturnEngine
from ..engine.synastry import SynastryEngine
from ..engine.harmonics import HarmonicsEngine
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
            
            # Convert house system name to code (placidus → P, koch → K, etc.)
            house_system_name = natal_chart.house_system or 'P'
            house_system_map = {
                'placidus': 'P',
                'koch': 'K',
                'equal': 'E',
                'whole_sign': 'W',
                'campanus': 'C',
                'regiomontanus': 'R',
                'porphyry': 'O',
            }
            house_system = house_system_map.get(house_system_name.lower(), house_system_name)
            
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


class CompositeChartView(APIView):
    """
    API endpoint for Composite Chart calculations
    
    POST /api/therapist/patients/{patient_id}/astrology/composite-chart/
        - Calculate Composite Chart between patient and another person
        - Body: {
            "person2_birth_date": "YYYY-MM-DD",
            "person2_birth_time": "HH:MM",
            "person2_latitude": float,
            "person2_longitude": float,
            "person2_name": str (optional)
        }
    """
    permission_classes = [IsAuthenticated, IsTherapist, CanAccessPatient]
    
    def post(self, request, patient_id):
        """Calculate Composite Chart for patient and another person"""
        try:
            # Verify patient exists and user has access
            patient = Patient.objects.get(id=patient_id)
            self.check_object_permissions(request, patient)
            
            # Get natal chart to extract birth data
            chart_service = ChartService()
            natal_chart = chart_service.get_natal_chart(patient_id)
            
            if not natal_chart:
                return Response(
                    {"error": "No natal chart found. Please create natal chart first."},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Validate person2 data from request
            person2_birth_date = request.data.get('person2_birth_date')
            person2_birth_time = request.data.get('person2_birth_time', '12:00')
            person2_latitude = request.data.get('person2_latitude')
            person2_longitude = request.data.get('person2_longitude')
            person2_name = request.data.get('person2_name', 'Persona 2')
            
            if not all([person2_birth_date, person2_latitude, person2_longitude]):
                return Response(
                    {"error": "Missing required fields: person2_birth_date, person2_latitude, person2_longitude"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Parse person2 birth data
            try:
                p2_date = datetime.strptime(person2_birth_date, '%Y-%m-%d')
                p2_time_parts = person2_birth_time.split(':')
                p2_hour = int(p2_time_parts[0])
                p2_minute = int(p2_time_parts[1]) if len(p2_time_parts) > 1 else 0
            except ValueError as e:
                return Response(
                    {"error": f"Invalid date/time format: {str(e)}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            person2_data = {
                'year': p2_date.year,
                'month': p2_date.month,
                'day': p2_date.day,
                'hour': p2_hour,
                'minute': p2_minute,
                'latitude': float(person2_latitude),
                'longitude': float(person2_longitude)
            }
            
            # Extract person1 (patient) birth data from natal chart
            birth_datetime = natal_chart.birth_datetime
            person1_data = {
                'year': birth_datetime.year,
                'month': birth_datetime.month,
                'day': birth_datetime.day,
                'hour': birth_datetime.hour,
                'minute': birth_datetime.minute,
                'latitude': float(natal_chart.latitude),
                'longitude': float(natal_chart.longitude)
            }
            
            # Calculate Composite Chart
            composite_engine = CompositeChartEngine()
            composite_data = composite_engine.calculate_composite_chart(
                person1_data=person1_data,
                person2_data=person2_data
            )
            
            # Build response
            response_data = {
                'patient_id': patient_id,
                'person1': {
                    'name': patient.user.get_full_name() if hasattr(patient, 'user') else f'Paciente {patient_id}',
                    'birth_date': birth_datetime.strftime('%Y-%m-%d'),
                    'birth_time': birth_datetime.strftime('%H:%M')
                },
                'person2': {
                    'name': person2_name,
                    'birth_date': person2_birth_date,
                    'birth_time': person2_birth_time
                },
                'composite_chart': composite_data,
                'layer_availability': {
                    'compositeChart': True
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
                {"error": f"Composite Chart calculation not available: {str(e)}"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        except Exception as e:
            return Response(
                {"error": f"Error calculating Composite Chart: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class DavisonChartView(APIView):
    """
    API endpoint for Davison Relationship Chart calculations
    
    POST /api/therapist/patients/{patient_id}/astrology/davison-chart/
        - Calculate Davison Chart between patient and another person
        - Body: {
            "person2_birth_date": "YYYY-MM-DD",
            "person2_birth_time": "HH:MM",
            "person2_latitude": float,
            "person2_longitude": float,
            "person2_name": str (optional)
        }
    
    The Davison Chart differs from Composite Charts:
    - Composite: Calculates midpoints of individual planetary positions
    - Davison: Calculates ONE chart for the midpoint moment/location
    
    The Davison Chart represents the relationship as a single entity 
    with its own "birth" moment and location.
    """
    permission_classes = [IsAuthenticated, IsTherapist, CanAccessPatient]
    
    def post(self, request, patient_id):
        """Calculate Davison Relationship Chart for patient and another person"""
        try:
            # Verify patient exists and user has access
            patient = Patient.objects.get(id=patient_id)
            self.check_object_permissions(request, patient)
            
            # Get natal chart to extract birth data
            chart_service = ChartService()
            natal_chart = chart_service.get_natal_chart(patient_id)
            
            if not natal_chart:
                return Response(
                    {"error": "No natal chart found. Please create natal chart first."},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Validate person2 data from request
            person2_birth_date = request.data.get('person2_birth_date')
            person2_birth_time = request.data.get('person2_birth_time', '12:00')
            person2_latitude = request.data.get('person2_latitude')
            person2_longitude = request.data.get('person2_longitude')
            person2_name = request.data.get('person2_name', 'Persona 2')
            
            if not all([person2_birth_date, person2_latitude, person2_longitude]):
                return Response(
                    {"error": "Missing required fields: person2_birth_date, person2_latitude, person2_longitude"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Parse person2 birth data
            try:
                p2_date = datetime.strptime(person2_birth_date, '%Y-%m-%d')
                p2_time_parts = person2_birth_time.split(':')
                p2_hour = int(p2_time_parts[0])
                p2_minute = int(p2_time_parts[1]) if len(p2_time_parts) > 1 else 0
            except ValueError as e:
                return Response(
                    {"error": f"Invalid date/time format: {str(e)}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            person2_data = {
                'year': p2_date.year,
                'month': p2_date.month,
                'day': p2_date.day,
                'hour': p2_hour,
                'minute': p2_minute,
                'latitude': float(person2_latitude),
                'longitude': float(person2_longitude)
            }
            
            # Extract person1 (patient) birth data from natal chart
            birth_datetime = natal_chart.birth_datetime
            person1_data = {
                'year': birth_datetime.year,
                'month': birth_datetime.month,
                'day': birth_datetime.day,
                'hour': birth_datetime.hour,
                'minute': birth_datetime.minute,
                'latitude': float(natal_chart.latitude),
                'longitude': float(natal_chart.longitude)
            }
            
            # Calculate Davison Chart
            davison_engine = DavisonChartEngine()
            davison_data = davison_engine.calculate_davison_chart(
                person1_data=person1_data,
                person2_data=person2_data
            )
            
            # Build response
            response_data = {
                'patient_id': patient_id,
                'person1': {
                    'name': patient.user.get_full_name() if hasattr(patient, 'user') else f'Paciente {patient_id}',
                    'birth_date': birth_datetime.strftime('%Y-%m-%d'),
                    'birth_time': birth_datetime.strftime('%H:%M')
                },
                'person2': {
                    'name': person2_name,
                    'birth_date': person2_birth_date,
                    'birth_time': person2_birth_time
                },
                'davison_chart': davison_data,
                'layer_availability': {
                    'davisonChart': True
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
                {"error": f"Davison Chart calculation not available: {str(e)}"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        except Exception as e:
            return Response(
                {"error": f"Error calculating Davison Chart: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class TransitsView(APIView):
    """
    API endpoint for Planetary Transits calculations
    
    GET /api/therapist/patients/{patient_id}/astrology/transits/
        - Calculate current planetary transits for a patient
        - Query parameters:
            - target_date: YYYY-MM-DD (default: today)
            - outer_only: bool (default: false) - only show outer planet transits
    
    Transits show where planets are NOW compared to where they were at birth.
    This is the most fundamental predictive technique in astrology.
    """
    permission_classes = [IsAuthenticated, IsTherapist, CanAccessPatient]
    
    def get(self, request, patient_id):
        """Calculate planetary transits for patient"""
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
            
            # Check for outer_only parameter
            outer_only = request.query_params.get('outer_only', 'false').lower() == 'true'
            
            # Get natal chart to extract planet and house positions
            chart_service = ChartService()
            natal_chart = chart_service.get_natal_chart(patient_id)
            
            if not natal_chart:
                return Response(
                    {"error": "No natal chart found. Please create natal chart first."},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Convert natal planets and houses to dict format for transit engine
            natal_planets = []
            for planet in natal_chart.planets:
                natal_planets.append({
                    'planet_name': planet.planet_name,
                    'longitude': float(planet.longitude)
                })
            
            natal_houses = []
            for house in natal_chart.houses:
                natal_houses.append({
                    'number': house.house_number,
                    'cusp_longitude': float(house.cusp_longitude)
                })
            
            # Calculate transits
            transits_engine = TransitsEngine()
            transits_data = transits_engine.calculate_transits(
                natal_planets=natal_planets,
                natal_houses=natal_houses,
                target_date=target_date,
                include_outer_only=outer_only
            )
            
            # Get summary for AI interpretation
            transit_summary = transits_engine.get_transit_summary(
                natal_planets=natal_planets,
                natal_houses=natal_houses,
                target_date=target_date
            )
            
            # Build response
            response_data = {
                'patient_id': patient_id,
                'birth_date': natal_chart.birth_datetime.strftime('%Y-%m-%d %H:%M'),
                'target_date': target_date,
                'transits': transits_data,
                'summary': transit_summary,
                'layer_availability': {
                    'transits': True
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
                {"error": f"Transits calculation not available: {str(e)}"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        except Exception as e:
            return Response(
                {"error": f"Error calculating transits: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ProgressionsView(APIView):
    """
    API endpoint for Secondary Progressions calculations
    
    GET /api/therapist/patients/{patient_id}/astrology/progressions/
        - Calculate secondary progressions for a patient
        - Query parameters:
            - target_date: YYYY-MM-DD (default: today)
    
    Secondary Progressions use the "day for a year" technique:
    - 1 day of planetary movement = 1 year of life
    - To find progressions for age 30, calculate positions 30 days after birth
    
    The Progressed Moon is especially important, taking ~27 years to circle the zodiac.
    """
    permission_classes = [IsAuthenticated, IsTherapist, CanAccessPatient]
    
    def get(self, request, patient_id):
        """Calculate secondary progressions for patient"""
        try:
            # Verify patient exists and user has access
            patient = Patient.objects.get(id=patient_id)
            self.check_object_permissions(request, patient)
            
            # Get target date from query params
            target_date = request.query_params.get('target_date')
            if not target_date:
                target_date = datetime.now().strftime('%Y-%m-%d')
            
            # Validate date format
            try:
                datetime.strptime(target_date, '%Y-%m-%d')
            except ValueError:
                return Response(
                    {"error": "Invalid date format. Use YYYY-MM-DD"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get natal chart
            chart_service = ChartService()
            natal_chart = chart_service.get_natal_chart(patient_id)
            
            if not natal_chart:
                return Response(
                    {"error": "No natal chart found. Please create natal chart first."},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Build birth data dict
            birth_datetime = natal_chart.birth_datetime
            birth_data = {
                'year': birth_datetime.year,
                'month': birth_datetime.month,
                'day': birth_datetime.day,
                'hour': birth_datetime.hour,
                'minute': birth_datetime.minute
            }
            
            # Convert natal planets and houses to dict format
            natal_planets = []
            for planet in natal_chart.planets:
                natal_planets.append({
                    'planet_name': planet.planet_name,
                    'longitude': float(planet.longitude)
                })
            
            natal_houses = []
            for house in natal_chart.houses:
                natal_houses.append({
                    'number': house.house_number,
                    'cusp_longitude': float(house.cusp_longitude)
                })
            
            # Calculate progressions
            progressions_engine = ProgressionsEngine()
            progressions_data = progressions_engine.calculate_progressions(
                birth_data=birth_data,
                natal_planets=natal_planets,
                natal_houses=natal_houses,
                target_date=target_date,
                latitude=float(natal_chart.latitude),
                longitude=float(natal_chart.longitude)
            )
            
            # Get summary
            progression_summary = progressions_engine.get_progression_summary(
                birth_data=birth_data,
                natal_planets=natal_planets,
                natal_houses=natal_houses,
                target_date=target_date,
                latitude=float(natal_chart.latitude),
                longitude=float(natal_chart.longitude)
            )
            
            # Build response
            response_data = {
                'patient_id': patient_id,
                'birth_date': birth_datetime.strftime('%Y-%m-%d %H:%M'),
                'target_date': target_date,
                'progressions': progressions_data,
                'summary': progression_summary,
                'layer_availability': {
                    'progressions': True
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
                {"error": f"Progressions calculation not available: {str(e)}"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        except Exception as e:
            return Response(
                {"error": f"Error calculating progressions: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class SolarReturnView(APIView):
    """
    API endpoint for Solar Return calculations
    
    GET /api/therapist/patients/{patient_id}/astrology/solar-return/
        - Calculate Solar Return for a specific year
        - Query parameters:
            - target_year: YYYY (default: current year)
            - location: "natal" or "current" (default: natal)
            - current_latitude: float (required if location=current)
            - current_longitude: float (required if location=current)
    
    The Solar Return is the moment when the Sun returns to its exact natal position.
    This occurs approximately once per year, around the birthday.
    The chart for this moment reveals themes for the coming year.
    """
    permission_classes = [IsAuthenticated, IsTherapist, CanAccessPatient]
    
    def get(self, request, patient_id):
        """Calculate Solar Return for patient"""
        try:
            # Verify patient exists and user has access
            patient = Patient.objects.get(id=patient_id)
            self.check_object_permissions(request, patient)
            
            # Get target year from query params
            target_year_str = request.query_params.get('target_year')
            if target_year_str:
                try:
                    target_year = int(target_year_str)
                except ValueError:
                    return Response(
                        {"error": "Invalid year format. Use YYYY"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            else:
                target_year = datetime.now().year
            
            # Get location preference
            location = request.query_params.get('location', 'natal')
            current_latitude = request.query_params.get('current_latitude')
            current_longitude = request.query_params.get('current_longitude')
            
            if location == 'current':
                if not current_latitude or not current_longitude:
                    return Response(
                        {"error": "current_latitude and current_longitude required when location=current"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                try:
                    current_latitude = float(current_latitude)
                    current_longitude = float(current_longitude)
                except ValueError:
                    return Response(
                        {"error": "Invalid latitude/longitude format"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            # Get natal chart
            chart_service = ChartService()
            natal_chart = chart_service.get_natal_chart(patient_id)
            
            if not natal_chart:
                return Response(
                    {"error": "No natal chart found. Please create natal chart first."},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Convert house system name to code
            house_system_name = natal_chart.house_system or 'P'
            house_system_map = {
                'placidus': 'P',
                'koch': 'K',
                'equal': 'E',
                'whole_sign': 'W',
                'campanus': 'C',
                'regiomontanus': 'R',
                'porphyry': 'O',
            }
            house_system = house_system_map.get(house_system_name.lower(), house_system_name)
            
            # Calculate Solar Return
            solar_return_engine = SolarReturnEngine()
            solar_return_data = solar_return_engine.calculate_solar_return(
                patient_id=patient_id,
                birth_datetime=natal_chart.birth_datetime,
                natal_latitude=natal_chart.latitude,
                natal_longitude=natal_chart.longitude,
                target_year=target_year,
                location=location,
                current_latitude=current_latitude,
                current_longitude=current_longitude,
                timezone=natal_chart.timezone or 'UTC',
                house_system=house_system,
                zodiac_type=natal_chart.zodiac_type or 'T'
            )
            
            # Build response
            response_data = {
                'patient_id': patient_id,
                'birth_date': natal_chart.birth_datetime.strftime('%Y-%m-%d %H:%M'),
                'target_year': target_year,
                'solar_return': solar_return_data,
                'layer_availability': {
                    'solarReturn': True
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
                {"error": f"Solar Return calculation error: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        except ImportError as e:
            return Response(
                {"error": f"Solar Return calculation not available: {str(e)}"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        except Exception as e:
            return Response(
                {"error": f"Error calculating Solar Return: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class SynastryView(APIView):
    """
    API endpoint for Synastry (relationship comparison) calculations
    
    POST /api/therapist/patients/{patient_id}/astrology/synastry/
        - Calculate Synastry between patient and another person
        - Body: {
            "person2_birth_date": "YYYY-MM-DD",
            "person2_birth_time": "HH:MM",
            "person2_latitude": float,
            "person2_longitude": float,
            "person2_name": str (optional)
        }
    
    Synastry compares two natal charts to analyze:
    - Inter-chart aspects (how planets interact)
    - House overlays (where person A's planets fall in B's houses)
    - Compatibility scoring
    """
    permission_classes = [IsAuthenticated, IsTherapist, CanAccessPatient]
    
    def post(self, request, patient_id):
        """Calculate Synastry for patient and another person"""
        try:
            # Verify patient exists and user has access
            patient = Patient.objects.get(id=patient_id)
            self.check_object_permissions(request, patient)
            
            # Get natal chart for patient (person 1)
            chart_service = ChartService()
            natal_chart = chart_service.get_natal_chart(patient_id)
            
            if not natal_chart:
                return Response(
                    {"error": "No natal chart found. Please create natal chart first."},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Validate person2 data from request
            person2_birth_date = request.data.get('person2_birth_date')
            person2_birth_time = request.data.get('person2_birth_time', '12:00')
            person2_latitude = request.data.get('person2_latitude')
            person2_longitude = request.data.get('person2_longitude')
            person2_name = request.data.get('person2_name', 'Persona 2')
            
            if not all([person2_birth_date, person2_latitude, person2_longitude]):
                return Response(
                    {"error": "Missing required fields: person2_birth_date, person2_latitude, person2_longitude"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Parse person2 birth data
            try:
                p2_date = datetime.strptime(person2_birth_date, '%Y-%m-%d')
                p2_time_parts = person2_birth_time.split(':')
                p2_hour = int(p2_time_parts[0])
                p2_minute = int(p2_time_parts[1]) if len(p2_time_parts) > 1 else 0
            except ValueError as e:
                return Response(
                    {"error": f"Invalid date/time format: {str(e)}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Calculate person 2's natal chart
            from decimal import Decimal
            from ..engine.natal_chart_engine import NatalChartEngine
            
            engine = NatalChartEngine()
            p2_birth_datetime = datetime(
                p2_date.year, p2_date.month, p2_date.day, p2_hour, p2_minute
            )
            
            # Get house system
            house_system_name = natal_chart.house_system or 'P'
            house_system_map = {
                'placidus': 'P', 'koch': 'K', 'equal': 'E',
                'whole_sign': 'W', 'campanus': 'C', 'regiomontanus': 'R',
            }
            house_system = house_system_map.get(house_system_name.lower(), house_system_name)
            
            person2_chart = engine.calculate_natal_chart(
                patient_id=0,  # Temp ID for person 2
                birth_datetime=p2_birth_datetime,
                latitude=Decimal(str(person2_latitude)),
                longitude=Decimal(str(person2_longitude)),
                timezone='UTC',
                house_system=house_system
            )
            
            # Convert planets and houses to list format
            person1_planets = [
                {'planet_name': p.planet_name, 'longitude': float(p.longitude), 'sign': p.sign}
                for p in natal_chart.planets
            ]
            person1_houses = [
                {'number': h.house_number, 'cusp_longitude': float(h.cusp_longitude)}
                for h in natal_chart.houses
            ]
            
            person2_planets = [
                {'planet_name': p.planet_name, 'longitude': float(p.longitude), 'sign': p.sign}
                for p in person2_chart.planets
            ]
            person2_houses = [
                {'number': h.house_number, 'cusp_longitude': float(h.cusp_longitude)}
                for h in person2_chart.houses
            ]
            
            # Get person 1 name
            person1_name = patient.user.get_full_name() if hasattr(patient, 'user') else f'Paciente {patient_id}'
            
            # Calculate Synastry
            synastry_engine = SynastryEngine()
            synastry_data = synastry_engine.calculate_synastry(
                person1_planets=person1_planets,
                person1_houses=person1_houses,
                person2_planets=person2_planets,
                person2_houses=person2_houses,
                person1_name=person1_name,
                person2_name=person2_name
            )
            
            # Build response
            response_data = {
                'patient_id': patient_id,
                'person1': {
                    'name': person1_name,
                    'birth_date': natal_chart.birth_datetime.strftime('%Y-%m-%d'),
                },
                'person2': {
                    'name': person2_name,
                    'birth_date': person2_birth_date,
                },
                'synastry': synastry_data,
                'layer_availability': {
                    'synastry': True
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
                {"error": f"Synastry calculation not available: {str(e)}"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        except Exception as e:
            return Response(
                {"error": f"Error calculating Synastry: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class HarmonicsView(APIView):
    """
    API endpoint for Harmonic Chart calculations
    
    GET /api/therapist/patients/{patient_id}/astrology/harmonics/
        - Get harmonic chart for patient
        - Query params:
            - harmonic: int (4, 5, 7, 8, 9, 12 - default: 5)
            - all: bool (if true, calculate H4, H5, H7, H9 together)
    
    Harmonics reveal hidden patterns by multiplying planetary positions.
    H4 = tension patterns, H5 = creativity, H7 = spirituality, H9 = soul purpose
    """
    permission_classes = [IsAuthenticated, IsTherapist, CanAccessPatient]

    def get(self, request, patient_id):
        """Calculate Harmonic Chart for patient"""
        try:
            # Verify patient exists
            patient = Patient.objects.get(id=patient_id)
            self.check_object_permissions(request, patient)

            # Get natal chart
            chart_service = ChartService()
            natal_chart = chart_service.get_natal_chart(patient_id)

            if not natal_chart:
                return Response(
                    {"error": "No natal chart found. Calculate natal chart first."},
                    status=status.HTTP_404_NOT_FOUND
                )

            # Extract natal planets
            natal_planets = [
                {
                    'planet_name': p.planet_name,
                    'longitude': float(p.longitude),
                    'sign': p.sign
                }
                for p in natal_chart.planets
            ]

            # Get query params
            calculate_all = request.query_params.get('all', 'false').lower() == 'true'
            harmonic_str = request.query_params.get('harmonic', '5')

            # Validate harmonic number
            try:
                harmonic = int(harmonic_str)
                if harmonic < 1 or harmonic > 360:
                    raise ValueError
            except ValueError:
                return Response(
                    {"error": "Harmonic must be an integer between 1 and 360"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Calculate harmonics
            harmonics_engine = HarmonicsEngine()

            if calculate_all:
                # Calculate multiple standard harmonics
                harmonics_data = harmonics_engine.calculate_multiple_harmonics(
                    natal_planets=natal_planets,
                    harmonics=[4, 5, 7, 9]
                )
                response_data = {
                    'patient_id': patient_id,
                    'calculation_mode': 'multiple',
                    'harmonics_calculated': [4, 5, 7, 9],
                    'data': harmonics_data,
                    'layer_availability': {
                        'harmonics': True
                    }
                }
            else:
                # Calculate single harmonic
                harmonic_data = harmonics_engine.calculate_harmonic_chart(
                    natal_planets=natal_planets,
                    harmonic_number=harmonic,
                    include_aspects=True
                )
                response_data = {
                    'patient_id': patient_id,
                    'calculation_mode': 'single',
                    'harmonic': harmonic,
                    'data': harmonic_data,
                    'layer_availability': {
                        'harmonics': True
                    }
                }

            return Response(response_data, status=status.HTTP_200_OK)

        except ObjectDoesNotExist:
            return Response(
                {"error": "Patient not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": f"Error calculating Harmonics: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )