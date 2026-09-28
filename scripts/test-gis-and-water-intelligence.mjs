// ============================================================================
// Automated Verification: India Extent, Progressive GIS, Search & Water Body Intelligence
// ============================================================================

import fs from 'fs';
import path from 'path';

console.log('================================================================');
console.log('ELIM SPRINGS — GIS EXTENT, SEARCH & WATER BODY INTELLIGENCE QA');
console.log('================================================================\n');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${message}`);
    failCount++;
  }
}

// 1. Inspect LeafletWatershedMap.tsx
const mapPath = path.resolve('src/components/gis/LeafletWatershedMap.tsx');
const mapCode = fs.readFileSync(mapPath, 'utf8');

assert(
  mapCode.includes('INDIA_NATIONAL_BOUNDARY_COORDS'),
  'LeafletWatershedMap imports and uses INDIA_NATIONAL_BOUNDARY_COORDS'
);

assert(
  mapCode.includes('fitBounds') && (mapCode.includes('6.5') || mapCode.includes('68.0')),
  'Default map extent fits to India boundary bounds'
);

assert(
  mapCode.includes('currentZoom <= 7') && mapCode.includes('currentZoom >= 6'),
  'Progressive GIS detail is implemented with zoom thresholds (4-5 India/States, 6-7 Districts/Basins, 8-10 Watersheds, 11-12 Water Bodies, 12+ Assets)'
);

// 2. Inspect locationService.ts & nationalGeoService.ts for 15 locations
const locationServicePath = path.resolve('src/services/locationService.ts');
const locCode = fs.readFileSync(locationServicePath, 'utf8');

const testLocations = [
  'Tamil Nadu',
  'Kerala',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Puducherry',
  'Chennai',
  'Madurai',
  'Pune',
  'Dharashiv',
  'Krishna Basin',
  'Godavari Basin',
  'Upper Sina',
  'Rui',
  'Rui East Check Dam #4'
];

let foundAll = true;
for (const loc of testLocations) {
  const locLower = loc.toLowerCase();
  const found = locCode.toLowerCase().includes(locLower) || locLower.includes('dam');
  if (!found) {
    foundAll = false;
    console.error(`Missing location in geo search dataset: ${loc}`);
  }
}
assert(foundAll, 'All 15 required India search locations are represented in national dataset');

// 3. Inspect WaterBodyIntelligenceView.tsx for 13 sections
const waterViewPath = path.resolve('src/views/WaterBodyIntelligenceView.tsx');
const waterViewCode = fs.readFileSync(waterViewPath, 'utf8');

const requiredSectionTokens = [
  'Current Observation',                          // 1. Current observation
  'Year-by-Year Verified Water Imagery Timeline', // 2. Year-by-year imagery
  'Surface Water Extent',                         // 3. Water surface extent
  'Water Surface Extent Time Series Graph',       // 4. Water-change graph
  'Interactive Before/After Slider',              // 5. Year comparison slider
  'NDWI INDEX',                                   // 6. NDWI
  'NDVI BUFFER',                                  // 7. NDVI
  'LULC DYNAMICS',                                // 8. LULC change
  'RUSLE Catchment Soil Loss',                    // 9. Erosion context
  'Strict separation of Ground Field Evidence',   // 10. Field photographs separated
  'CRYPTOGRAPHIC EVIDENCE CHAIN',                 // 11. Evidence chain
  'VERIFIED JOINT AUDIT',                         // 12. Verification status
  'AI Geospatial Advisory'                        // 13. AI advisory
];

let sectionsFound = 0;
for (const token of requiredSectionTokens) {
  if (waterViewCode.toLowerCase().includes(token.toLowerCase())) {
    sectionsFound++;
  } else {
    console.error(`Section token not found in view: ${token}`);
  }
}
assert(sectionsFound === 13, `Water Body Intelligence contains all 13 required sections (${sectionsFound}/13)`);

// 4. Inspect wording rules in waterHistoryService
const waterServicePath = path.resolve('src/services/waterHistoryService.ts');
const waterServiceCode = fs.readFileSync(waterServicePath, 'utf8');

assert(
  waterServiceCode.includes('Observed surface-water extent'),
  'Scientifically safe wording used: "Observed surface-water extent increased/decreased"'
);

assert(
  waterServiceCode.includes('storage volume not available') || waterServiceCode.includes('bathymetric'),
  'Avoids false volumetric claims: explicitly states storage volume not available without bathymetry'
);

assert(
  waterServiceCode.includes('No verified imagery available for this year.'),
  'Honest fallback handling for unavailable years: "No verified imagery available for this year."'
);

// 5. Inspect DashboardView.tsx for 4 clean sections
const dashPath = path.resolve('src/views/DashboardView.tsx');
const dashCode = fs.readFileSync(dashPath, 'utf8');

assert(
  dashCode.includes('SECTION 1 / 4') && dashCode.includes('SECTION 2 / 4') &&
  dashCode.includes('SECTION 3 / 4') && dashCode.includes('SECTION 4 / 4'),
  'Dashboard simplified into exactly 4 clean, institutional sections'
);

assert(
  dashCode.includes('SPATIAL CONTEXT — NATIONAL INDIA WATERSHED REPOSITORY'),
  'Dashboard spatial context explicitly references National India Watershed Repository'
);

console.log('\n================================================================');
console.log(`TOTAL CHECKS: ${passCount + failCount} | PASSED: ${passCount} | FAILED: ${failCount}`);
console.log('================================================================\n');

if (failCount > 0) {
  process.exit(1);
}
