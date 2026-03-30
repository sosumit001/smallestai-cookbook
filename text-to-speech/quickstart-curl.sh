#!/bin/bash
# Text-to-Speech Quickstart — cURL
# Generate speech from text using Lightning v3.1.
#
# Usage:
#     export SMALLEST_API_KEY="your-api-key"
#     bash quickstart-curl.sh
#
# Docs: https://docs.smallest.ai/waves/documentation/text-to-speech-lightning/quickstart

curl -X POST "https://api.smallest.ai/waves/v1/lightning-v3.1/get_speech" \
  -H "Authorization: Bearer $SMALLEST_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"text":"Modern problems require modern solutions.","voice_id":"magnus","sample_rate":24000,"speed":1.0,"language":"en","output_format":"wav"}' \
  --output output.wav

echo "Saved output.wav ($(wc -c < output.wav) bytes)"
