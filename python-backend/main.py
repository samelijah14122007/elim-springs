"""
ELIM SPRINGS — Python Geo-AI Service
FastAPI application entry point.

Architecture:
  React + TypeScript (port 5173)
        ↓  HTTP / REST
  Python FastAPI Geo-AI Service (port 8000)   ← this file
        ↓
  Geospatial / AI Processing (NumPy, GeoPandas, Rasterio)
        ↓
  Supabase PostgreSQL + Storage (server-side env vars only)

Start:
  uvicorn main:app --reload --port 8000
"""

from __future__ import annotations
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from api.health import router as health_router
from api.geospatial import router as geospatial_router
from api.bhashini import router as bhashini_router

# Load environment variables from .env if present
load_dotenv()

# -----------------------------------------------------------------------
# CORS — allow the React dev server to call this API.
# In production, set CORS_ORIGINS to the deployed frontend domain.
# -----------------------------------------------------------------------
_raw_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173")
ALLOWED_ORIGINS: list[str] = [o.strip() for o in _raw_origins.split(",") if o.strip()]

# -----------------------------------------------------------------------
# FastAPI application
# -----------------------------------------------------------------------
app = FastAPI(
    title="ELIM SPRINGS Python Geo-AI Service",
    description=(
        "Geospatial and AI-processing backend for ELIM SPRINGS. "
        "Handles NDVI, NDWI, change detection, evidence analysis, and Bhashini Indic voice pipeline."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------------------------------------------------
# Routers
# -----------------------------------------------------------------------
app.include_router(health_router)
app.include_router(geospatial_router)
app.include_router(bhashini_router)


# -----------------------------------------------------------------------
# Root redirect to docs
# -----------------------------------------------------------------------
@app.get("/", include_in_schema=False)
async def root():
    return {
        "message": "ELIM SPRINGS Python Geo-AI Service",
        "docs": "/docs",
        "health": "/health",
    }
