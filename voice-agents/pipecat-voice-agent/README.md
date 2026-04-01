# Pipecat Voice Agent


Smallest AI's TTS is now natively integrated into [Pipecat](https://github.com/pipecat-ai/pipecat) — the open-source framework for real-time voice + AI pipelines. This example shows you how to wire it up into a fully working voice agent that runs in your browser.  

Speak, and the agent responds using Smallest AI's low-latency `sophia` voice. Start speaking again while it's talking — the response stops mid-sentence and the agent picks up your new input immediately. Pipecat handles this natively, so there’s no need to write custom interruption logic.

---

## How It Works

```
Browser microphone
        │
        ▼
SmallWebRTCTransport (WebRTC)
        │
        ▼
       STT  ──►  OpenAI LLM  ──►  Smallest AI TTS
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
| `DEEPGRAM_API_KEY` | *(required)* | Your Deepgram API key |
| Voice | `sophia` | Hardcoded in `main.py` — change to any voice at [waves.smallest.ai](https://waves.smallest.ai) |

---

## What to Try

- **Interrupt mid-sentence** — start speaking while the assistant is talking; it stops immediately
- **Ask a long question** — watch the assistant respond in a continuous stream
- **Change the voice** — edit the `voice` field in `main.py` to any voice ID from [waves.smallest.ai](https://waves.smallest.ai)
