"""
Unit tests for FastAPI Bhashini server-side endpoints.
"""

import base64
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def create_test_wav_base64() -> str:
    """Generate a minimal valid 16-bit PCM WAV in memory."""
    sample_rate = 16000
    num_samples = 1600  # 0.1 second
    data_bytes = num_samples * 2

    # 44-byte WAV header
    header = bytearray()
    header.extend(b"RIFF")
    header.extend((36 + data_bytes).to_bytes(4, "little"))
    header.extend(b"WAVE")
    header.extend(b"fmt ")
    header.extend((16).to_bytes(4, "little"))  # subchunk1size (16 for PCM)
    header.extend((1).to_bytes(2, "little"))   # audioFormat (1 for PCM)
    header.extend((1).to_bytes(2, "little"))   # numChannels (1 for mono)
    header.extend(sample_rate.to_bytes(4, "little"))
    header.extend((sample_rate * 2).to_bytes(4, "little"))  # byteRate
    header.extend((2).to_bytes(2, "little"))   # blockAlign
    header.extend((16).to_bytes(2, "little"))  # bitsPerSample
    header.extend(b"data")
    header.extend(data_bytes.to_bytes(4, "little"))

    # Silence samples (zeros)
    pcm_data = bytes(data_bytes)
    full_wav = bytes(header) + pcm_data
    return base64.b64encode(full_wav).decode("ascii")


def test_bhashini_status():
    resp = client.get("/api/bhashini/status")
    assert resp.status_code == 200
    data = resp.json()
    assert "isConfigured" in data
    assert "status" in data
    assert "mr" in data["supportedLanguages"]
    print("[OK] GET /api/bhashini/status passed:", data["status"])


def test_bhashini_asr_invalid_audio():
    # Test invalid non-WAV payload
    resp = client.post(
        "/api/bhashini/asr",
        json={"audio_base64": base64.b64encode(b"NOT A REAL WAV FILE").decode("ascii"), "language": "mr"},
    )
    assert resp.status_code == 400
    assert "expected 16-bit PCM WAV" in resp.json()["detail"]
    print("[OK] POST /api/bhashini/asr rejects invalid audio correctly (HTTP 400)")


def test_bhashini_asr_valid_wav_format():
    wav_b64 = create_test_wav_base64()
    resp = client.post(
        "/api/bhashini/asr",
        json={"audio_base64": wav_b64, "language": "mr"},
    )
    # If credentials are not configured, it should return 503 SERVICE UNAVAILABLE with clear error
    # If credentials are configured, it should return 200 or 502 (if mock keys)
    assert resp.status_code in (200, 502, 503)
    if resp.status_code == 503:
        assert "Bhashini credentials not configured" in resp.json()["detail"]
    print(f"[OK] POST /api/bhashini/asr validated WAV header and handled auth gracefully (status {resp.status_code})")


def test_bhashini_translate_empty_text():
    resp = client.post(
        "/api/bhashini/translate",
        json={"text": "   ", "sourceLanguage": "mr", "targetLanguage": "en"},
    )
    assert resp.status_code == 400
    print("[OK] POST /api/bhashini/translate rejects empty text correctly (HTTP 400)")


def test_bhashini_tts_empty_text():
    resp = client.post(
        "/api/bhashini/tts",
        json={"text": "", "language": "mr"},
    )
    assert resp.status_code in (400, 422)
    print("[OK] POST /api/bhashini/tts rejects empty text correctly")


if __name__ == "__main__":
    print("Running Python Bhashini API tests...")
    test_bhashini_status()
    test_bhashini_asr_invalid_audio()
    test_bhashini_asr_valid_wav_format()
    test_bhashini_translate_empty_text()
    test_bhashini_tts_empty_text()
    print("All Python Bhashini API unit tests passed successfully!")
