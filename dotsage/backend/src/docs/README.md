Seed this folder with static Polkadot doc snippets to ground LLM responses.

Recommended structure:
- governance.json
- builders.json
- docs.json
- ecosystem.json

Each file can contain an array of objects:
[
  {
    "title": "Page Title",
    "url": "https://wiki.polkadot.network/...",
    "content": "Short excerpt of the relevant section..."
  }
]


