"""
ELIM SPRINGS — Raster processing service.
Handles band array conversion and safe raster I/O utilities.
"""

from __future__ import annotations
import numpy as np
from typing import List


def list_to_array(data: List[List[float]]) -> np.ndarray:
    """Convert a nested Python list to a NumPy float64 array."""
    arr = np.array(data, dtype=np.float64)
    if arr.ndim != 2:
        raise ValueError(
            f"Expected a 2-D array (rows x cols), got shape {arr.shape}."
        )
    return arr


def array_to_list(arr: np.ndarray) -> List[List[float]]:
    """Convert a NumPy 2-D array back to a nested Python list (JSON-serialisable)."""
    return np.where(np.isfinite(arr), arr, None).tolist()  # type: ignore[return-value]


def compute_statistics(arr: np.ndarray) -> dict:
    """
    Compute basic descriptive statistics, ignoring NaN values.
    Returns dict with min, max, mean, std.
    """
    valid = arr[np.isfinite(arr)]
    if valid.size == 0:
        return {"min": 0.0, "max": 0.0, "mean": 0.0, "std": 0.0}
    return {
        "min": float(np.nanmin(valid)),
        "max": float(np.nanmax(valid)),
        "mean": float(np.nanmean(valid)),
        "std": float(np.nanstd(valid)),
    }


def validate_same_shape(a: np.ndarray, b: np.ndarray, a_name: str = "a", b_name: str = "b") -> None:
    """Raise a clear error if two arrays do not share the same shape."""
    if a.shape != b.shape:
        raise ValueError(
            f"Array shapes must match: '{a_name}' is {a.shape} but '{b_name}' is {b.shape}."
        )
