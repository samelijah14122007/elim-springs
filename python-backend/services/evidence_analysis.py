"""
ELIM SPRINGS — Evidence analysis service.

Derives a structured priority assessment from supplied field evidence.

IMPORTANT:
- This service ONLY analyses data supplied by the caller.
- It does NOT invent or fabricate satellite observations.
- It does NOT claim live remote-sensing connectivity unless a real source is provided.
- All outputs are clearly marked with a disclaimer when based on partial data.
"""

from __future__ import annotations
from typing import List, Optional


# Priority scoring weights
_ISSUE_WEIGHTS = {
    "Breach Risk": 9.5,
    "Foundation seepage": 9.0,
    "Structural damage": 8.5,
    "Crack / structural concern": 8.0,
    "Heavy Siltation": 7.0,
    "Silt accumulation": 6.5,
    "Encroachment concern": 6.0,
    "Water presence": 4.0,
    "Vegetation stress": 4.5,
    "Construction progress": 3.0,
    "Completed intervention": 1.5,
}

_ASSET_MULTIPLIERS = {
    "Check Dam": 1.0,
    "Masonry Check Dam": 1.1,
    "Percolation Tank": 1.0,
    "Farm Pond": 0.85,
    "Recharge Shaft": 0.9,
    "Sub-surface Dyke": 0.95,
    "Continuous Contour Trench (CCT)": 0.8,
}


def analyse_evidence(
    latitude: float,
    longitude: float,
    asset_type: str,
    issue_category: str,
    ocr_text: Optional[str],
    field_observations: Optional[List[str]],
    satellite_obs: Optional[dict],
    reporter_role: Optional[str],
) -> dict:
    """
    Compute a structured priority assessment from supplied evidence.

    Returns priority_score (0–10), label, recommended_action, notes,
    geo_context, and honest data_sources_used list.
    """
    notes: List[str] = []
    data_sources: List[str] = []

    # --- Base score from issue category ---
    base_score = _ISSUE_WEIGHTS.get(issue_category, 5.0)
    data_sources.append(f"Issue category: '{issue_category}'")

    # --- Asset-type multiplier ---
    multiplier = _ASSET_MULTIPLIERS.get(asset_type, 1.0)
    score = base_score * multiplier
    data_sources.append(f"Asset type: '{asset_type}'")

    # --- Field observations bonus ---
    if field_observations:
        obs_boost = 0.0
        for obs in field_observations:
            obs_weight = _ISSUE_WEIGHTS.get(obs, 0.0)
            obs_boost = max(obs_boost, obs_weight * 0.3)
        score = min(10.0, score + obs_boost)
        notes.append(f"Field observations boosted priority: {', '.join(field_observations)}")
        data_sources.append("Field observation tags")

    # --- OCR text presence ---
    if ocr_text and len(ocr_text.strip()) > 10:
        notes.append("OCR-extracted signboard text available — scheme and work code present.")
        data_sources.append("Signboard OCR text")
    else:
        notes.append("No OCR text supplied — scheme verification not possible from this request.")

    # --- Satellite observations (ONLY if actually supplied) ---
    if satellite_obs:
        ndvi = satellite_obs.get("ndvi_value")
        ndwi = satellite_obs.get("ndwi_value")
        source = satellite_obs.get("source", "satellite imagery")

        if ndvi is not None:
            data_sources.append(f"NDVI from {source}")
            if ndvi < 0.2:
                score = min(10.0, score + 1.0)
                notes.append(f"Low NDVI ({ndvi:.3f}) suggests significant vegetation stress or bare soil.")
            elif ndvi > 0.5:
                notes.append(f"Healthy NDVI ({ndvi:.3f}) — vegetation appears stable.")

        if ndwi is not None:
            data_sources.append(f"NDWI from {source}")
            if ndwi > 0.2:
                notes.append(f"Positive NDWI ({ndwi:.3f}) indicates surface water presence.")
            elif ndwi < -0.1:
                notes.append(f"Negative NDWI ({ndwi:.3f}) suggests dry / non-water surface.")
    else:
        notes.append(
            "No satellite observations supplied. "
            "Satellite-derived indices were NOT fabricated — "
            "submit NDVI/NDWI values from the raster endpoints if available."
        )

    # --- Reporter role context ---
    if reporter_role:
        notes.append(f"Reported by: {reporter_role}.")

    score = round(min(10.0, max(0.0, score)), 2)
    priority_label = _score_to_label(score)
    recommended_action = _recommended_action(priority_label, asset_type, issue_category)

    from services.watershed_service import geo_context_for_point
    geo_context = geo_context_for_point(latitude, longitude)

    return {
        "priority_score": score,
        "priority_label": priority_label,
        "recommended_action": recommended_action,
        "analysis_notes": notes,
        "geo_context": geo_context,
        "data_sources_used": data_sources,
        "disclaimer": (
            "This analysis is based solely on data supplied in the request. "
            "It does not independently verify field conditions or satellite imagery. "
            "Field inspection by a qualified engineer is required before any remediation decision."
        ),
    }


def _score_to_label(score: float) -> str:
    if score >= 8.5:
        return "Critical"
    elif score >= 6.5:
        return "High"
    elif score >= 4.0:
        return "Medium"
    else:
        return "Low"


def _recommended_action(label: str, asset_type: str, issue: str) -> str:
    if label == "Critical":
        return (
            f"Immediate inspection required for {asset_type}. "
            f"Issue '{issue}' poses structural or safety risk. "
            "Notify Block-level Junior Engineer and District Project Management Unit within 24 hours."
        )
    elif label == "High":
        return (
            f"Schedule urgent field verification for {asset_type} within 7 days. "
            f"'{issue}' may worsen with rainfall or seasonal conditions."
        )
    elif label == "Medium":
        return (
            f"Include {asset_type} in next scheduled maintenance cycle. "
            f"Document '{issue}' with photographic evidence."
        )
    else:
        return (
            f"No immediate action required for {asset_type}. "
            "Monitor during next quarterly inspection."
        )
