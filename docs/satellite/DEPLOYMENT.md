# 🚀 PARAKH Satellite Subsystem Deployment & Configuration
## Document: `docs/satellite/DEPLOYMENT.md`

---

## 1. Environment Variables & Credentials Management

The satellite cross-verification engine supports both live Copernicus Data Space Ecosystem (CDSE) connections and offline demonstration fixture modes. **Never commit credentials or client secrets to version control.**

### 1.1 Configuration Variables (`.env`)

```bash
# Copernicus Data Space Ecosystem (CDSE) API Credentials
COPERNICUS_CLIENT_ID="your-cdse-client-id"
COPERNICUS_CLIENT_SECRET="your-cdse-client-secret"
COPERNICUS_TOKEN_URL="https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token"
COPERNICUS_API_BASE_URL="https://catalogue.dataspace.copernicus.eu/stac"

# Satellite Provider Routing Mode ('auto' | 'copernicus' | 'synthetic')
SATELLITE_PROVIDER="auto"

# Satellite Processing & Cache Configuration
SATELLITE_CACHE_ENABLED="true"
SATELLITE_CACHE_TTL="86400"
SATELLITE_MAX_CLOUD_COVER="20.0"
SATELLITE_REQUEST_TIMEOUT="15.0"
```

### 1.2 Graceful Fallback Behavior
- If `COPERNICUS_CLIENT_ID` or `COPERNICUS_CLIENT_SECRET` are not configured:
  The engine remains **100% operational in Demo Mode** (`is_synthetic = True`, `aoi_provenance = "PARAKH DEMO GEOMETRY"`).
- If live CDSE discovery fails or times out:
  The engine returns **`INCONCLUSIVE`** rather than fabricating fake "live" observations.

---

## 2. Production Health Checks & Observability

Monitor satellite infrastructure health via:
```http
GET /api/v1/satellite/health
```

Sample Response:
```json
{
  "status": "OPERATIONAL",
  "engine_version": "sat-engine v1.0",
  "config_version": "config v0.3-provisional",
  "copernicus_cdse_stac_api": "ONLINE",
  "supported_missions": [
    "Sentinel-2 L2A (10m Optical)",
    "Sentinel-1 IW (C-Band SAR GRD)"
  ],
  "cache_status": "ENABLED",
  "temporal_lookahead_gate": "STRICT_ENFORCED (acquisition <= evaluation_month)"
}
```

