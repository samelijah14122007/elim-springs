# ELIM SPRINGS — Python Geo-AI Backend

A separate Python FastAPI service that handles geospatial and AI-processing tasks for ELIM SPRINGS.

## Architecture

```
React + TypeScript (port 5173)
        ↓  HTTP
Python FastAPI Geo-AI Service (port 8000)
        ↓
Geospatial / AI Processing (NumPy, GeoPandas, Rasterio)
        ↓
Supabase PostgreSQL + Storage (server-side only)
```

## Quick Start

```bash
cd python-backend
python -m pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The API will be available at: http://localhost:8000  
Interactive docs (Swagger): http://localhost:8000/docs

## Environment Variables

Copy `.env.example` to `.env` and fill in values:

```bash
copy .env.example .env
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /health | Service health check |
| POST | /api/ndvi | Calculate NDVI from band arrays |
| POST | /api/ndwi | Calculate NDWI from band arrays |
| POST | /api/change-detection | Detect change between two raster states |
| POST | /api/evidence-analysis | Analyse structured field evidence |

## NDVI Example

```bash
curl -X POST http://localhost:8000/api/ndvi \
  -H "Content-Type: application/json" \
  -d '{
    "red": [[0.12, 0.15], [0.11, 0.14]],
    "nir": [[0.45, 0.48], [0.42, 0.50]]
  }'
```

## NDWI Example

```bash
curl -X POST http://localhost:8000/api/ndwi \
  -H "Content-Type: application/json" \
  -d '{
    "green": [[0.22, 0.25], [0.20, 0.23]],
    "nir": [[0.45, 0.48], [0.42, 0.50]]
  }'
```

## Security

- Never commit `.env` to version control.
- Supabase service-role key is ONLY used server-side in Python — never in the React frontend.
- CORS is restricted to `http://localhost:5173` during development.
- Add your production domain to `CORS_ORIGINS` in `.env` when deploying.

## Running Both Services Together

Terminal 1 — Python backend:
```bash
cd python-backend
uvicorn main:app --reload --port 8000
```

Terminal 2 — React frontend:
```bash
npm run dev
```
