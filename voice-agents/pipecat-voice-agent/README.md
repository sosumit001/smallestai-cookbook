# Pipecat Voice Agent

A minimal interruptible voice assistant built with [Pipecat](https://github.com/pipecat-ai/pipecat) and Smallest AI.

This is an integration stub — it shows how to plug Smallest AI's TTS into a Pipecat pipeline. The interesting Pipecat-specific behaviour (interruption, VAD, context memory) is documented below, but the framework doing the heavy lifting is Pipecat. See the [Pipecat docs](https://docs.pipecat.ai) for a deeper dive.

Speak to the assistant in the browser, interrupt it mid-sentence at any time — Pipecat stops playback instantly and picks up your new input. No custom logic required; interruption is a first-class feature of the Pipecat pipeline.

---

## How It Works

```
Browser microphone
        │
        ▼
SmallWebRTCTransport (WebRTC)
        │
        ▼
Deepgram STT  ──►  OpenAI LLM  ──►  Smallest AI TTS
                                           │
                                           ▼
                              SmallWebRTCTransport (WebRTC)
                                           │
                                           ▼
                                  Browser speaker output
```

When Silero VAD detects you speaking while the assistant is talking, Pipecat sends an `InterruptionFrame` that cancels the in-flight TTS immediately. Your speech is transcribed, sent to the LLM, and a new response begins — all within the same persistent pipeline.

---

## Setup

**Requirements**

- Python 3.10+
- A microphone — accessed directly through the browser, no system dependencies needed

**Install**

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.sample .env
# Edit .env and add your API keys
```

**Run**

```bash
python main.py
```

Then open **http://localhost:7860** in your browser. Click **Connect**, allow microphone access, and start talking.

Press `Ctrl+C` to stop.

---

## Configuration

| Variable | Default | Description |
|---|---|---|
| `SMALLEST_API_KEY` | *(required)* | Your Smallest AI API key — [get one here](https://waves.smallest.ai) |
| `OPENAI_API_KEY` | *(required)* | Your OpenAI API key |
| `DEEPGRAM_API_KEY` | *(required)* | Your Deepgram API key — [get one here](https://console.deepgram.com) |
| Voice | `sophia` | Hardcoded in `main.py` — change to any voice at [waves.smallest.ai](https://waves.smallest.ai) |

---

## What to Try

- **Interrupt mid-sentence** — start speaking while the assistant is talking; it stops immediately
- **Ask a long question** — watch the assistant respond in a continuous stream
- **Change the voice** — edit the `voice` field in `main.py` to any voice ID from [waves.smallest.ai](https://waves.smallest.ai)
