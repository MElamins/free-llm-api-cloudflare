# Free LLM API on Cloudflare Workers

A tiny text-generation API that runs on Cloudflare Workers AI. You deploy it once, set one secret, and you get a URL you can call from anywhere — curl, Python, a frontend, whatever. The free tier of Workers AI gives you 10,000 neurons per day, which is roughly a few hundred calls depending on the model, so for a personal project or a prototype it costs nothing.

It supports whatever text-generation models are available on Workers AI, and the default is Llama 4 Scout. You can also pass `model` per request to switch — e.g. Llama 3.3 70B for heavier reasoning, Qwen 3 for multilingual work, or GLM 4.7 Flash when you want fast responses.

## What's in the repo

```
worker.js            the whole API (~70 lines, no dependencies)
wrangler.toml        Cloudflare config, including the AI binding
package.json         just so `npm run dev` / `npm run deploy` work
.dev.vars.example    template for your local API key
```

## Setup

1. Create a free [Cloudflare account](https://dash.cloudflare.com/sign-up) if you don't have one.
2. Clone this repo and install wrangler:

```bash
npm install
```

3. Log in:

```bash
npx wrangler login
```

4. Set your API key as a secret (don't commit it, don't use a plain text variable):

```bash
npx wrangler secret put API_KEY
```

5. Deploy:

```bash
npx wrangler deploy
```

Wrangler will print your URL, something like `https://free-llm-api.<your-subdomain>.workers.dev`. That's it — the AI binding is already in `wrangler.toml`, so there's nothing to click through in the dashboard.

For local development, copy `.dev.vars.example` to `.dev.vars`, put a key in it, and run `npm run dev`.

## Usage

All requests are `POST /` with a JSON body and a `Bearer` auth header. Two body shapes are accepted:

- `{"prompt": "..."}` — a single prompt
- `{"messages": [{"role": "user", "content": "..."}]}` — a chat-style conversation

Optional fields: `model` (string), `max_tokens` (1–4096), `temperature` (0–1).

### curl

```bash
curl -X POST https://your-worker.workers.dev/ \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Explain DNS in two sentences."}'
```

Response looks like:

```json
{"model":"@cf/meta/llama-4-scout-17b-16e-instruct","response":"DNS is ..."}
```

### Switching models

```bash
curl -X POST https://your-worker.workers.dev/ \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Write a haiku about servers", "model": "@cf/zai-org/glm-4.7-flash"}'
```

Model IDs come from the [Workers AI catalog](https://developers.cloudflare.com/workers-ai/models/). Note that bigger models burn through the daily free neurons much faster — Llama 3.3 70B uses noticeably more per call than the default.

### Python

```python
import requests

def generate(prompt, model=None):
    body = {"prompt": prompt}
    if model:
        body["model"] = model
    r = requests.post(
        "https://your-worker.workers.dev/",
        headers={"Authorization": "Bearer your-api-key"},
        json=body,
    )
    r.raise_for_status()
    return r.json()["response"]

print(generate("Give me three names for a coffee shop"))
```

## Honest limitations

- **Rate limits / quota are Cloudflare's, not yours.** When you hit the free neuron cap, requests fail until the next day. There's no retry logic here — add it on the caller side if you need it.
- **No streaming.** Responses come back as one JSON blob. Fine for short outputs, less fun for long ones.
- **CORS is wide open** (`*`). That's intentional so frontends work out of the box, but it means anyone can craft browser requests — your API key is what protects you, so don't ship it in client-side code.
- **If `API_KEY` isn't set, everything returns 401.** It fails closed on purpose; a keyless deployment shouldn't be publicly usable.
- **Output shape varies slightly between models.** Most return `{"response": "..."}`; the worker normalizes the common case, but if you get an object back instead of a string, check the model's docs page.

## Troubleshooting

- **401 Unauthorized** — the `Authorization` header must be exactly `Bearer <key>`, and the `API_KEY` secret must be set on the deployed worker (not just locally).
- **Model errors** — check the ID against the [model catalog](https://developers.cloudflare.com/workers-ai/models/); IDs are versioned and occasionally change.
- **Local dev doesn't find the key** — you need a `.dev.vars` file for `wrangler dev`; secrets set with `wrangler secret put` only exist in production.

## License

MIT.
