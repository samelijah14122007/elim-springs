"""
ELIM SPRINGS — Watershed geometry and spatial analysis service.
Uses GeoPandas and Shapely for watershed boundary operations.
"""

from __future__ import annotations
from typing import Optional, Tuple
import numpy as np


def estimate_watershed_area_ha(bounds: Tuple[float, float, float, float]) -> float:
    """
    Estimate the approximate area of a bounding box in hectares.
    bounds: (min_lon, min_lat, max_lon, max_lat)
    Uses a simple equirectangular approximation suitable for small areas.
    """
    min_lon, min_lat, max_lon, max_lat = bounds
    # Degrees to metres approximations at the centroid latitude
    lat_centre = (min_lat + max_lat) / 2.0
    metres_per_deg_lat = 111_320.0
    metres_per_deg_lon = 111_320.0 * np.cos(np.radians(lat_centre))

    width_m = abs(max_lon - min_lon) * metres_per_deg_lon
    height_m = abs(max_lat - min_lat) * metres_per_deg_lat
    area_m2 = width_m * height_m
    area_ha = area_m2 / 10_000.0
    return round(area_ha, 2)


def geo_context_for_point(lat: float, lon: float) -> dict:
    """
    Return simple geographic context for a lat/lon point.
    This uses public coordinate ranges to identify broad Indian river basin zones.
    Does NOT claim live satellite data.
    """
    context = {
        "latitude": lat,
        "longitude": lon,
        "country": "India",
        "approximate_zone": _identify_basin_zone(lat, lon),
    }
    return context


def _identify_basin_zone(lat: float, lon: float) -> str:
    """
    Very coarse classification of major Indian river basin zones
    based on coordinate ranges only.
    """
    if lat > 28.0 and lon < 78.0:
        return "Indus Basin Zone"
    elif lat > 25.0 and 78.0 <= lon <= 84.0:
        return "Ganga-Yamuna Basin Zone"
    elif lat > 25.0 and lon > 84.0:
        return "Brahmaputra Basin Zone"
    elif 20.0 <= lat <= 25.0 and 73.0 <= lon <= 80.0:
        return "Narmada-Tapi Basin Zone"
    elif 15.0 <= lat <= 21.0 and 73.0 <= lon <= 82.0:
        return "Godavari-Krishna Basin Zone"
    elif 8.0 <= lat <= 15.0 and 76.0 <= lon <= 80.5:
        return "Cauvery Basin Zone"
    elif lat < 12.0 and lon < 77.0:
        return "West-Flowing Rivers Zone (Kerala)"
    else:
        return "Peninsular India Zone"
