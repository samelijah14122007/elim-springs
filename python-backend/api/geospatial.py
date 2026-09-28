"""
ELIM SPRINGS — Geospatial API endpoints.
Handles NDVI, NDWI, change detection, and evidence analysis.
"""

from __future__ import annotations
import numpy as np
from fastapi import APIRouter, HTTPException

from models.schemas import (
    NDVIRequest, NDVIResponse,
    NDWIRequest, NDWIResponse,
    ChangeDetectionRequest, ChangeDetectionResponse,
    EvidenceAnalysisRequest, EvidenceAnalysisResponse,
    BandStatistics,
)
from services.raster_service import (
    list_to_array, array_to_list, compute_statistics, validate_same_shape
)
from services.change_detection import compute_change
from services.evidence_analysis import analyse_evidence

router = APIRouter(prefix="/api", tags=["Geospatial"])


# ---------------------------------------------------------------------------
# POST /api/ndvi
# ---------------------------------------------------------------------------

@router.post("/ndvi", response_model=NDVIResponse)
async def calculate_ndvi(body: NDVIRequest) -> NDVIResponse:
    """
    Calculate Normalised Difference Vegetation Index (NDVI).

    NDVI = (NIR - RED) / (NIR + RED)

    Division by zero is handled safely: pixels where (NIR + RED) == 0
    are set to NaN and excluded from statistics.
    """
    try:
        red = list_to_array(body.red)
        nir = list_to_array(body.nir)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    try:
        validate_same_shape(red, nir, "red", "nir")
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    # Safe NDVI — suppress divide-by-zero; result is NaN where denominator == 0
    denominator = nir + red
    with np.errstate(invalid="ignore", divide="ignore"):
        ndvi = np.where(denominator != 0, (nir - red) / denominator, np.nan)

    stats = compute_statistics(ndvi)
    pixel_count = ndvi.size
    valid_pixel_count = int(np.sum(np.isfinite(ndvi)))

    mean_val = stats["mean"]
    if mean_val > 0.6:
        interpretation = "Dense healthy vegetation. Catchment likely well-vegetated."
    elif mean_val > 0.3:
        interpretation = "Moderate vegetation cover. Seasonal variation or partial degradation possible."
    elif mean_val > 0.1:
        interpretation = "Sparse vegetation. Potential land degradation or dry-season conditions."
    else:
        interpretation = "Very low or no vegetation detected. Bare soil, water body, or built-up area."

    return NDVIResponse(
        ndvi=array_to_list(ndvi),
        statistics=BandStatistics(**stats),
        pixel_count=pixel_count,
        valid_pixel_count=valid_pixel_count,
        interpretation=interpretation,
    )


# ---------------------------------------------------------------------------
# POST /api/ndwi
# ---------------------------------------------------------------------------

@router.post("/ndwi", response_model=NDWIResponse)
async def calculate_ndwi(body: NDWIRequest) -> NDWIResponse:
    """
    Calculate Normalised Difference Water Index (NDWI — McFeeters 1996).

    NDWI = (GREEN - NIR) / (GREEN + NIR)

    Positive values (> 0) generally indicate open water surfaces.
    Division by zero is handled safely.
    """
    try:
        green = list_to_array(body.green)
        nir = list_to_array(body.nir)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    try:
        validate_same_shape(green, nir, "green", "nir")
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    denominator = green + nir
    with np.errstate(invalid="ignore", divide="ignore"):
        ndwi = np.where(denominator != 0, (green - nir) / denominator, np.nan)

    stats = compute_statistics(ndwi)
    pixel_count = ndwi.size
    valid_pixel_count = int(np.sum(np.isfinite(ndwi)))
    water_pixel_count = int(np.sum(ndwi[np.isfinite(ndwi)] > 0))
    water_coverage_pct = round((water_pixel_count / valid_pixel_count * 100.0), 2) if valid_pixel_count > 0 else 0.0

    mean_val = stats["mean"]
    if mean_val > 0.3:
        interpretation = "High water index — significant open water extent detected."
    elif mean_val > 0.0:
        interpretation = "Moderate water index — partial water cover or moist soil conditions."
    elif mean_val > -0.1:
        interpretation = "Near-zero NDWI — transitional land/water boundary or seasonally wet soil."
    else:
        interpretation = "Negative NDWI — predominantly dry land, bare soil, or dense vegetation."

    return NDWIResponse(
        ndwi=array_to_list(ndwi),
        statistics=BandStatistics(**stats),
        pixel_count=pixel_count,
        valid_pixel_count=valid_pixel_count,
        water_pixel_count=water_pixel_count,
        water_coverage_pct=water_coverage_pct,
        interpretation=interpretation,
    )


# ---------------------------------------------------------------------------
# POST /api/change-detection
# ---------------------------------------------------------------------------

@router.post("/change-detection", response_model=ChangeDetectionResponse)
async def detect_change(body: ChangeDetectionRequest) -> ChangeDetectionResponse:
    """
    Detect pixel-wise change between two raster states (T1 → T2).
    Typically applied to NDVI or NDWI arrays at two different dates.
    """
    try:
        t1 = list_to_array(body.t1)
        t2 = list_to_array(body.t2)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    try:
        validate_same_shape(t1, t2, "t1", "t2")
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    result = compute_change(t1, t2, threshold=body.threshold)

    return ChangeDetectionResponse(
        difference=array_to_list(result["difference"]),
        statistics=BandStatistics(**result["statistics"]),
        total_pixels=result["total_pixels"],
        changed_pixels=result["changed_pixels"],
        unchanged_pixels=result["unchanged_pixels"],
        changed_area_pct=result["changed_area_pct"],
        mean_change=result["mean_change"],
        direction=result["direction"],
        interpretation=result["interpretation"],
    )


# ---------------------------------------------------------------------------
# POST /api/evidence-analysis
# ---------------------------------------------------------------------------

@router.post("/evidence-analysis", response_model=EvidenceAnalysisResponse)
async def evidence_analysis(body: EvidenceAnalysisRequest) -> EvidenceAnalysisResponse:
    """
    Analyse structured field evidence and return a priority assessment.

    This endpoint processes ONLY data supplied in the request body.
    It does NOT independently fetch or fabricate satellite observations.
    """
    satellite_obs_dict = body.satellite_observations.model_dump() if body.satellite_observations else None

    result = analyse_evidence(
        latitude=body.latitude,
        longitude=body.longitude,
        asset_type=body.asset_type,
        issue_category=body.issue_category,
        ocr_text=body.ocr_text,
        field_observations=body.field_observations,
        satellite_obs=satellite_obs_dict,
        reporter_role=body.reporter_role,
    )

    return EvidenceAnalysisResponse(**result)
