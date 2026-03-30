"""
Text-to-Speech Quickstart — Python
Generate speech from text using Lightning v3.1.

Usage:
    export SMALLEST_API_KEY="your-api-key"
    python quickstart-python.py

Docs: https://docs.smallest.ai/waves/documentation/text-to-speech-lightning/quickstart
"""

import os
import requests

API_KEY = os.environ["SMALLEST_API_KEY"]

response = requests.post(
    "https://api.smallest.ai/waves/v1/lightning-v3.1/get_speech",
    headers={
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
    },
    json={
        "text": "Modern problems require modern solutions.",
        "voice_id": "magnus",
        "sample_rate": 24000,
        "speed": 1.0,
        "language": "en",
        "output_format": "wav",
    },
)

response.raise_for_status()
with open("output.wav", "wb") as f:
    f.write(response.content)
print(f"Saved output.wav ({len(response.content):,} bytes)")
