"""
ELIM SPRINGS — Change detection service.
Computes pixel-wise difference between two raster states (T1 and T2).
Typically applied to NDVI, NDWI, or raw spectral band arrays.
"""

from __future__ import annotations
import numpy as np
from services.raster_service import compute_statistics


def compute_change(
    t1: np.ndarray,
    t2: np.ndarray,
    threshold: float = 0.05,
) -> dict:
    """
    Compute pixel-wise change between T1 and T2.

    Parameters
    ----------
    t1 : np.ndarray  — raster at earlier date
    t2 : np.ndarray  — raster at later date
    threshold : float — absolute difference to count a pixel as 'changed'

    Returns
    -------
    dict with difference array, statistics, and change metrics.
    """
    diff = t2 - t1  # positive = increase, negative = decrease

    total_pixels = diff.size
    changed_mask = np.abs(diff) > threshold
    changed_pixels = int(np.sum(changed_mask))
    unchanged_pixels = total_pixels - changed_pixels
    changed_area_pct = round((changed_pixels / total_pixels) * 100.0, 2) if total_pixels > 0 else 0.0
    mean_change = float(np.nanmean(diff))

    # Determine overall direction of change
    positive_change = int(np.sum(diff[changed_mask] > 0))
    negative_change = int(np.sum(diff[changed_mask] < 0))

    if changed_pixels == 0:
        direction = "stable"
    elif positive_change > negative_change * 2:
        direction = "increase"
    elif negative_change > positive_change * 2:
        direction = "decrease"
    else:
        direction = "mixed"

    stats = compute_statistics(diff)

    interpretation = _interpret_change(mean_change, changed_area_pct, direction)

    return {
        "difference": diff,
        "statistics": stats,
        "total_pixels": total_pixels,
        "changed_pixels": changed_pixels,
        "unchanged_pixels": unchanged_pixels,
        "changed_area_pct": changed_area_pct,
        "mean_change": round(mean_change, 6),
        "direction": direction,
        "interpretation": interpretation,
    }


def _interpret_change(mean_change: float, changed_pct: float, direction: str) -> str:
    if changed_pct < 5.0:
        return "Negligible change detected. Scene is largely stable between the two dates."
    if direction == "decrease" and mean_change < -0.10:
        return (
            "Significant negative change detected — possible vegetation loss, "
            "water depletion, or land degradation. Field verification recommended."
        )
    if direction == "increase" and mean_change > 0.10:
        return (
            "Significant positive change detected — possible vegetation recovery, "
            "increased surface water, or land cover improvement."
        )
    if direction == "mixed":
        return (
            f"{changed_pct:.1f}% of pixels show change in mixed directions. "
            "Heterogeneous land-cover transitions — detailed classification advised."
        )
    return (
        f"{changed_pct:.1f}% of pixels changed ({direction}). "
        "Moderate change — investigate further with field data."
    )
