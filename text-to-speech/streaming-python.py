"""
TTS Streaming — Python
Stream speech via SSE (Server-Sent Events) for real-time playback.

Usage:
    export SMALLEST_API_KEY="your-api-key"
    pip install requests
    python streaming-python.py

Docs: https://docs.smallest.ai/waves/documentation/text-to-speech-lightning/streaming
"""

import os
import wave
import requests

API_KEY = os.environ["SMALLEST_API_KEY"]

response = requests.post(
    "https://api.smallest.ai/waves/v1/lightning-v3.1/stream",
    headers={
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
    },
    json={
        "text": "Modern problems require modern solutions.",
        "voice_id": "magnus",
        "sample_rate": 24000,
    },
    stream=True,
)

response.raise_for_status()

with wave.open("streamed.wav", "wb") as wf:
    wf.setnchannels(1)
    wf.setsampwidth(2)
    wf.setframerate(24000)
    total = 0
    for chunk in response.iter_content(chunk_size=4096):
        wf.writeframes(chunk)
        total += len(chunk)

print(f"Saved streamed.wav ({total:,} bytes)")
