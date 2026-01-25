# Lunar Return Implementation

## Overview
Implemented complete Lunar Return calculation system using Swiss Ephemeris iterative search algorithm.

## Changes

### Backend

#### 1. New Engine Module: `backend/astrology/engine/lunar_return.py`
- **Class**: `LunarReturnEngine`
- **Main Method**: `calculate_lunar_return()` - Calculates exact moment when Moon returns to natal position
- **Algorithm**:
  1. Calculate natal Moon longitude (0-360°)
  2. Coarse search: 1-hour increments through target month
  3. Refine search: 1-minute increments within ±1 hour of closest match
  4. Calculate full natal chart for exact return moment
- **Helper Methods**:
  - `_coarse_search()` - Hourly search
  - `_refine_search()` - Minute-level refinement
  - `_angular_difference()` - Handles 360° wrap-around

#### 2. New API Endpoint: `LunarReturnView`
- **Path**: `/api/therapist/patients/{patient_id}/astrology/lunar-return/`
- **Method**: GET
- **Query Params**:
  - `target_month` (required): "YYYY-MM" format
- **Response**:
  ```json
  {
    "patient_id": 1,
    "birth_date": "1990-05-15 10:30",
    "target_month": "2026-01",
    "lunar_return": {
      "return_datetime": "2026-01-18T15:22:00",
      "lunar_position": 296.3902,
      "return_lunar_position": 296.3914,
      "chart": { ... },
      "precision": 0.001197,
      "target_month": "2026-01"
    },
    "layer_availability": {
      "lunarReturn": true
    }
  }
  ```

#### 3. URL Registration
- Added route to `backend/astrology/api/urls.py`
- Pattern: `patients/<int:patient_id>/lunar-return/`

#### 4. Tests
- **Unit Tests**: `backend/astrology/tests/test_lunar_return.py`
  - Test lunar return calculation
  - Test angular difference helper
  - Test coarse search
  - Test error handling
- **Management Command**: `test_lunar_return_cmd`
  - Quick verification tool
  - Example output shows precision: **0.001197° (4.3 arcseconds)**

## Technical Details

### Algorithm Performance
- **Coarse Search**: ~744 iterations (31 days × 24 hours)
- **Refine Search**: ~120 iterations (2 hours × 60 minutes)
- **Total Time**: 3-5 seconds per calculation
- **Precision**: Typically < 0.01° (< 36 arcseconds)

### Astronomical Context
- **Sidereal Month**: 27.3216 days (Moon's orbital period)
- **Synodic Month**: 29.5306 days (lunar phase cycle)
- Lunar returns occur ~13 times per year

### Swiss Ephemeris Integration
- Uses `swe.calc_ut(jd, 1)` for Moon position
- Planet ID 1 = Moon
- Returns longitude, latitude, distance, speed

### Error Handling
- Validates target_month format (YYYY-MM)
- Raises ValueError if no return found in target month
- Returns HTTP 400 for invalid input
- Returns HTTP 503 if Swiss Ephemeris unavailable

## Verification Results

**Test Run** (Birth: 1990-05-15 10:30, Target: 2026-01):
```
Return DateTime: 2026-01-18T15:22:00
Natal Moon:      296.3902°
Return Moon:     296.3914°
Precision:       0.001197° ✅
```

## Usage Example

```bash
# Django management command
python manage.py test_lunar_return_cmd

# HTTP API
GET /api/therapist/patients/1/astrology/lunar-return/?target_month=2026-01
Authorization: Bearer <token>
```

## Next Steps (Frontend Integration)
1. Add `lunarReturn` to layer types in AstrologyWorkspace
2. Detect `mode='real'` + `layer='return_lunar'`
3. Send API request with `target_month` param
4. Render lunar return chart overlay
5. Display return datetime and precision metadata

## Files Modified
- ✅ `backend/astrology/engine/lunar_return.py` (NEW)
- ✅ `backend/astrology/api/views.py` (LunarReturnView added)
- ✅ `backend/astrology/api/urls.py` (route registered)
- ✅ `backend/astrology/tests/test_lunar_return.py` (NEW)
- ✅ `backend/astrology/management/commands/test_lunar_return_cmd.py` (NEW)
