"""
Test all documentation code snippets.

Usage:
    export SMALLEST_API_KEY="your-api-key"
    pip install requests pytest
    pytest docs/tests/test_snippets.py -v

These tests verify that all code samples in the docs produce valid responses.
"""

import os
import subprocess
import requests
import pytest

API_KEY = os.environ.get("SMALLEST_API_KEY")
SAMPLE_URL = "https://github.com/smallest-inc/cookbook/raw/main/speech-to-text/getting-started/samples/audio.wav"
TTS_ENDPOINT = "https://api.smallest.ai/waves/v1/lightning-v3.1/get_speech"
STT_ENDPOINT = "https://api.smallest.ai/waves/v1/pulse/get_text"
VOICES_ENDPOINT = "https://api.smallest.ai/waves/v1/lightning-v3.1/get_voices"
SSE_ENDPOINT = "https://api.smallest.ai/waves/v1/lightning-v3.1/stream"


@pytest.fixture
def auth_headers():
    assert API_KEY, "SMALLEST_API_KEY environment variable required"
    return {"Authorization": f"Bearer {API_KEY}"}


class TestTTS:
    def test_sync_synthesis(self, auth_headers):
        assert False, "Deliberate failure to test Slack notification"
        r = requests.post(
            TTS_ENDPOINT,
            headers={**auth_headers, "Content-Type": "application/json"},
            json={
                "text": "Hello from Smallest AI.",
                "voice_id": "magnus",
                "sample_rate": 24000,
                "output_format": "wav",
            },
        )
        assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text}"
        assert len(r.content) > 1000, f"Audio too small: {len(r.content)} bytes"

    def test_sse_streaming(self, auth_headers):
        r = requests.post(
            SSE_ENDPOINT,
            headers={**auth_headers, "Content-Type": "application/json"},
            json={
                "text": "Hello from streaming.",
                "voice_id": "magnus",
                "sample_rate": 24000,
            },
            stream=True,
        )
        assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text}"
        content = b"".join(r.iter_content())
        assert len(content) > 1000, f"Stream too small: {len(content)} bytes"

    def test_get_voices(self, auth_headers):
        r = requests.get(VOICES_ENDPOINT, headers=auth_headers)
        assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text}"
        data = r.json()
        assert len(data) > 0, "No voices returned"


class TestSTT:
    def test_transcribe_url(self, auth_headers):
        r = requests.post(
            STT_ENDPOINT,
            params={"language": "en"},
            headers={**auth_headers, "Content-Type": "application/json"},
            json={"url": SAMPLE_URL},
            timeout=120,
        )
        assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text}"
        result = r.json()
        assert result["status"] == "success", f"Expected success: {result}"
        assert "transcription" in result

    def test_transcribe_file_upload(self, auth_headers):
        audio = requests.get(SAMPLE_URL).content
        assert len(audio) > 1000, "Failed to download sample audio"

        r = requests.post(
            STT_ENDPOINT,
            params={"language": "en"},
            headers={**auth_headers, "Content-Type": "audio/wav"},
            data=audio,
            timeout=120,
        )
        assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text}"
        result = r.json()
        assert result["status"] == "success"

    def test_transcribe_with_features(self, auth_headers):
        audio = requests.get(SAMPLE_URL).content
        r = requests.post(
            STT_ENDPOINT,
            params={"language": "en", "word_timestamps": "true", "diarize": "true"},
            headers={**auth_headers, "Content-Type": "audio/wav"},
            data=audio,
            timeout=120,
        )
        assert r.status_code == 200
        result = r.json()
        assert result["status"] == "success"
        assert "words" in result


class TestExternalURLs:
    def test_cookbook_audio_accessible(self):
        r = requests.head(SAMPLE_URL, allow_redirects=True, timeout=10)
        assert r.status_code == 200, f"Cookbook audio URL returned {r.status_code}"

    def test_cookbook_python_scripts_exist(self):
        base = "https://github.com/smallest-inc/cookbook/raw/main"
        scripts = [
            "text-to-speech/quickstart-python.py",
            "speech-to-text/transcribe-python.py",
        ]
        for script in scripts:
            r = requests.head(f"{base}/{script}", allow_redirects=True, timeout=10)
            assert r.status_code == 200, f"{script} not found (HTTP {r.status_code})"
