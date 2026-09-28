"""
ELIM SPRINGS — Pydantic request/response schemas.
All data contracts between the React frontend and this Python service are defined here.
"""

from __future__ import annotations
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# NDVI
# ---------------------------------------------------------------------------

class NDVIRequest(BaseModel):
    """
    Input: raw reflectance arrays for the Red and Near-Infrared bands.
    Values should be normalised floats (0.0 – 1.0) or raw DN integers.
    Both arrays must have the same shape.
    """
    red: List[List[float]] = Field(
        ...,
        description="2-D array of Red band reflectance values.",
        example=[[0.12, 0.15], [0.11, 0.14]],
    )
    nir: List[List[float]] = Field(
        ...,
        description="2-D array of Near-Infrared band reflectance values.",
        example=[[0.45, 0.48], [0.42, 0.50]],
    )


class BandStatistics(BaseModel):
    min: float
    max: float
    mean: float
    std: float


class NDVIResponse(BaseModel):
    ndvi: List[List[float]] = Field(..., description="Calculated NDVI pixel values (same shape as input).")
    statistics: BandStatistics
    pixel_count: int
    valid_pixel_count: int  # pixels where (NIR + RED) != 0
    interpretation: str


# ---------------------------------------------------------------------------
# NDWI
# ---------------------------------------------------------------------------

class NDWIRequest(BaseModel):
    """
    Input: Green and Near-Infrared band arrays (McFeeters 1996 formulation).
    NDWI = (GREEN - NIR) / (GREEN + NIR)
    """
    green: List[List[float]] = Field(
        ...,
        description="2-D array of Green band reflectance values.",
        example=[[0.22, 0.25], [0.20, 0.23]],
    )
    nir: List[List[float]] = Field(
        ...,
        description="2-D array of Near-Infrared band reflectance values.",
        example=[[0.45, 0.48], [0.42, 0.50]],
    )


class NDWIResponse(BaseModel):
    ndwi: List[List[float]] = Field(..., description="Calculated NDWI pixel values.")
    statistics: BandStatistics
    pixel_count: int
    valid_pixel_count: int
    water_pixel_count: int  # pixels where NDWI > 0
    water_coverage_pct: float
    interpretation: str


# ---------------------------------------------------------------------------
# Change Detection
# ---------------------------------------------------------------------------

class ChangeDetectionRequest(BaseModel):
    """
    Two raster states (T1 and T2) as 2-D numerical arrays.
    Typically derived from NDVI, NDWI, or raw band data at two different dates.
    """
    t1: List[List[float]] = Field(
        ...,
        description="Raster state at time T1 (earlier date).",
        example=[[0.45, 0.50], [0.42, 0.48]],
    )
    t2: List[List[float]] = Field(
        ...,
        description="Raster state at time T2 (later date).",
        example=[[0.30, 0.35], [0.28, 0.32]],
    )
    threshold: float = Field(
        default=0.05,
        description="Absolute difference threshold above which a pixel is considered 'changed'.",
    )


class ChangeDetectionResponse(BaseModel):
    difference: List[List[float]]
    statistics: BandStatistics
    total_pixels: int
    changed_pixels: int
    unchanged_pixels: int
    changed_area_pct: float
    mean_change: float
    direction: str  # "increase" | "decrease" | "mixed" | "stable"
    interpretation: str


# ---------------------------------------------------------------------------
# Evidence Analysis
# ---------------------------------------------------------------------------

class SatelliteObservation(BaseModel):
    """Caller supplies this — Python does NOT invent satellite data."""
    ndvi_value: Optional[float] = None
    ndwi_value: Optional[float] = None
    lulc_class: Optional[str] = None
    observation_date: Optional[str] = None
    source: Optional[str] = Field(default=None, description="e.g. 'Sentinel-2 L2A'")


class EvidenceAnalysisRequest(BaseModel):
    latitude: float
    longitude: float
    asset_type: str = Field(description="e.g. 'Check Dam', 'Percolation Tank'")
    issue_category: str = Field(description="e.g. 'Silt accumulation', 'Breach Risk'")
    ocr_text: Optional[str] = Field(default=None, description="Text extracted from field signboard via OCR.")
    field_observations: Optional[List[str]] = Field(
        default=None,
        description="List of observed condition tags from the field inspector.",
    )
    satellite_observations: Optional[SatelliteObservation] = Field(
        default=None,
        description="Satellite-derived indices — supply only if actually available.",
    )
    reporter_role: Optional[str] = None


class EvidenceAnalysisResponse(BaseModel):
    priority_score: float = Field(description="0–10 priority score derived from supplied evidence.")
    priority_label: str  # "Critical" | "High" | "Medium" | "Low"
    recommended_action: str
    analysis_notes: List[str]
    geo_context: Dict[str, Any]
    data_sources_used: List[str]
    disclaimer: str


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------

class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    python_backend: bool
