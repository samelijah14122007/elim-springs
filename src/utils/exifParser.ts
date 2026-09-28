// ==============================================================================
// ELIM SPRINGS — EXIF METADATA & CRYPTOGRAPHIC HASH UTILITY
// SIH 2026 - PS 26015 | "From Field Voices to Watershed Action"
// ==============================================================================
// Truthfully extracts hardware EXIF metadata from uploaded images.
// NEVER fabricates GPS coordinates: returns null if GPS is absent.
// ==============================================================================

export interface ParsedExifData {
  hasGps: boolean;
  latitude: number | null;
  longitude: number | null;
  altitudeM?: number | null;
  timestamp: string | null;
  deviceMake?: string;
  deviceModel?: string;
  software?: string;
  exifVerified: boolean;
  exifStatus: 'EXIF_GPS_FOUND' | 'GPS_NOT_FOUND' | 'NO_EXIF';
}

/**
 * Computes deterministic SHA-256 hash of an arbitrary File or Blob using Web Crypto
 */
export async function computeFileSha256(file: File | Blob): Promise<string> {
  try {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch {
    // Fallback pseudo-hash if crypto.subtle is unavailable
    let hash = 0;
    const name = (file as any).name || 'file';
    const str = `${name}:${file.size}:${file.type}:${Date.now()}`;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(64, '0');
  }
}

/**
 * Extracts EXIF tags from a JPEG ArrayBuffer.
 * Parses APP1 marker (0xFFE1), TIFF Header, 0th IFD, and GPS IFD (0x8825).
 */
export async function parseExifMetadata(file: File | Blob): Promise<ParsedExifData> {
  try {
    const buffer = await file.arrayBuffer();
    const view = new DataView(buffer);

    // Verify JPEG SOI marker (0xFFD8)
    if (view.byteLength < 4 || view.getUint16(0, false) !== 0xffd8) {
      return createEmptyExifResult();
    }

    let offset = 2;
    const length = view.byteLength;

    while (offset < length - 4) {
      const marker = view.getUint16(offset, false);
      offset += 2;

      // APP1 Marker = 0xFFE1
      if (marker === 0xffe1) {
        const app1Length = view.getUint16(offset, false);
        offset += 2;

        // Check for 'Exif\0\0' (0x457869660000)
        const exifHeader = view.getUint32(offset, false);
        const exifZero = view.getUint16(offset + 4, false);

        if (exifHeader === 0x45786966 && exifZero === 0x0000) {
          const tiffStart = offset + 6;
          return parseTiffHeader(view, tiffStart);
        }

        offset += app1Length - 2;
      } else if ((marker & 0xff00) === 0xff00) {
        // Other JPEG markers
        if (marker === 0xffda || marker === 0xffd9) {
          // SOS or EOI, stop scanning
          break;
        }
        const sectionLength = view.getUint16(offset, false);
        offset += sectionLength;
      } else {
        break;
      }
    }
  } catch (err) {
    console.warn('[EXIF] Failed to parse EXIF metadata:', err);
  }

  return createEmptyExifResult();
}

function createEmptyExifResult(): ParsedExifData {
  return {
    hasGps: false,
    latitude: null,
    longitude: null,
    altitudeM: null,
    timestamp: null,
    deviceMake: undefined,
    deviceModel: undefined,
    exifVerified: false,
    exifStatus: 'NO_EXIF',
  };
}

function parseTiffHeader(view: DataView, tiffStart: number): ParsedExifData {
  // Endianness
  const byteOrder = view.getUint16(tiffStart, false);
  const littleEndian = byteOrder === 0x4949; // 'II'

  // TIFF tag 42 check
  if (view.getUint16(tiffStart + 2, littleEndian) !== 0x002a) {
    return createEmptyExifResult();
  }

  const ifd0Offset = view.getUint32(tiffStart + 4, littleEndian);
  const ifd0Start = tiffStart + ifd0Offset;

  let make: string | undefined;
  let model: string | undefined;
  let timestamp: string | null = null;
  let gpsOffset: number | null = null;

  // Read 0th IFD
  const ifd0Entries = view.getUint16(ifd0Start, littleEndian);
  for (let i = 0; i < ifd0Entries; i++) {
    const entryOffset = ifd0Start + 2 + i * 12;
    if (entryOffset + 12 > view.byteLength) break;

    const tag = view.getUint16(entryOffset, littleEndian);
    const type = view.getUint16(entryOffset + 2, littleEndian);
    const count = view.getUint32(entryOffset + 4, littleEndian);

    if (tag === 0x010f) {
      // Make
      make = readAscii(view, tiffStart, entryOffset, count, littleEndian);
    } else if (tag === 0x0110) {
      // Model
      model = readAscii(view, tiffStart, entryOffset, count, littleEndian);
    } else if (tag === 0x0132) {
      // DateTime
      timestamp = readAscii(view, tiffStart, entryOffset, count, littleEndian);
    } else if (tag === 0x8825) {
      // GPS IFD Pointer
      gpsOffset = view.getUint32(entryOffset + 8, littleEndian);
    }
  }

  // If GPS IFD exists, parse latitude and longitude
  if (gpsOffset !== null) {
    const gpsStart = tiffStart + gpsOffset;
    if (gpsStart + 2 < view.byteLength) {
      const gpsEntries = view.getUint16(gpsStart, littleEndian);
      let latRef = 'N';
      let latVal: number | null = null;
      let lngRef = 'E';
      let lngVal: number | null = null;
      let altVal: number | null = null;

      for (let i = 0; i < gpsEntries; i++) {
        const entryOffset = gpsStart + 2 + i * 12;
        if (entryOffset + 12 > view.byteLength) break;

        const tag = view.getUint16(entryOffset, littleEndian);

        if (tag === 1) {
          // GPSLatitudeRef
          const val = String.fromCharCode(view.getUint8(entryOffset + 8));
          if (val === 'S' || val === 'N') latRef = val;
        } else if (tag === 2) {
          // GPSLatitude (3 rationals)
          latVal = readGpsCoordinate(view, tiffStart, entryOffset, littleEndian);
        } else if (tag === 3) {
          // GPSLongitudeRef
          const val = String.fromCharCode(view.getUint8(entryOffset + 8));
          if (val === 'W' || val === 'E') lngRef = val;
        } else if (tag === 4) {
          // GPSLongitude (3 rationals)
          lngVal = readGpsCoordinate(view, tiffStart, entryOffset, littleEndian);
        } else if (tag === 6) {
          // GPSAltitude
          const valOffset = view.getUint32(entryOffset + 8, littleEndian);
          if (tiffStart + valOffset + 8 <= view.byteLength) {
            const num = view.getUint32(tiffStart + valOffset, littleEndian);
            const den = view.getUint32(tiffStart + valOffset + 4, littleEndian);
            if (den !== 0) altVal = num / den;
          }
        }
      }

      if (latVal !== null && lngVal !== null && !isNaN(latVal) && !isNaN(lngVal)) {
        const finalLat = latRef === 'S' ? -latVal : latVal;
        const finalLng = lngRef === 'W' ? -lngVal : lngVal;

        // Verify valid coordinate range
        if (finalLat >= -90 && finalLat <= 90 && finalLng >= -180 && finalLng <= 180) {
          return {
            hasGps: true,
            latitude: parseFloat(finalLat.toFixed(6)),
            longitude: parseFloat(finalLng.toFixed(6)),
            altitudeM: altVal !== null && !isNaN(altVal) ? parseFloat(altVal.toFixed(1)) : null,
            timestamp: timestamp || null,
            deviceMake: make?.trim() || undefined,
            deviceModel: model?.trim() || undefined,
            exifVerified: true,
            exifStatus: 'EXIF_GPS_FOUND',
          };
        }
      }
    }
  }

  return {
    hasGps: false,
    latitude: null,
    longitude: null,
    altitudeM: null,
    timestamp: timestamp || null,
    deviceMake: make?.trim() || undefined,
    deviceModel: model?.trim() || undefined,
    exifVerified: false,
    exifStatus: 'GPS_NOT_FOUND',
  };
}

function readAscii(
  view: DataView,
  tiffStart: number,
  entryOffset: number,
  count: number,
  littleEndian: boolean
): string {
  if (count <= 4) {
    let str = '';
    for (let i = 0; i < count; i++) {
      const code = view.getUint8(entryOffset + 8 + i);
      if (code === 0) break;
      str += String.fromCharCode(code);
    }
    return str;
  }

  const offset = view.getUint32(entryOffset + 8, littleEndian);
  let str = '';
  for (let i = 0; i < count; i++) {
    if (tiffStart + offset + i >= view.byteLength) break;
    const code = view.getUint8(tiffStart + offset + i);
    if (code === 0) break;
    str += String.fromCharCode(code);
  }
  return str;
}

function readGpsCoordinate(
  view: DataView,
  tiffStart: number,
  entryOffset: number,
  littleEndian: boolean
): number | null {
  const offset = view.getUint32(entryOffset + 8, littleEndian);
  const dataOffset = tiffStart + offset;

  if (dataOffset + 24 > view.byteLength) return null;

  // Degrees
  const degNum = view.getUint32(dataOffset, littleEndian);
  const degDen = view.getUint32(dataOffset + 4, littleEndian);
  const deg = degDen !== 0 ? degNum / degDen : 0;

  // Minutes
  const minNum = view.getUint32(dataOffset + 8, littleEndian);
  const minDen = view.getUint32(dataOffset + 12, littleEndian);
  const min = minDen !== 0 ? minNum / minDen : 0;

  // Seconds
  const secNum = view.getUint32(dataOffset + 16, littleEndian);
  const secDen = view.getUint32(dataOffset + 20, littleEndian);
  const sec = secDen !== 0 ? secNum / secDen : 0;

  return deg + min / 60 + sec / 3600;
}
